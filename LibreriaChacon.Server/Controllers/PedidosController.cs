// En Controllers/PedidosController.cs
using LibreriaChacon.Server.Contexts;
using LibreriaChacon.Server.DTOs;
using LibreriaChacon.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LibreriaChacon.Server.Controllers
{
 
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Todo este controlador requiere que el usuario esté autenticado
    public class PedidosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PedidosController(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- AÑADIDO: Endpoint para que el ADMIN/OPERADOR vea TODOS los pedidos ---
        // GET: api/pedidos
        [HttpGet]
        [Authorize(Roles = "Administrador,Operador")]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetAllPedidos()
        {
            return await _context.Pedidos
                .Include(p => p.Usuario) // Incluimos los datos del perfil que hizo el pedido
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();
        }

        // --- AÑADIDO: Endpoint para que el CLIENTE vea SUS PROPIOS pedidos ---
        // GET: api/pedidos/mis-pedidos
        [HttpGet("mis-pedidos")]
        [Authorize(Roles = "Cliente")]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetMisPedidos()
        {
            var usuarioId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            return await _context.Pedidos
                .Where(p => p.UsuarioId == usuarioId)
                .Include(p => p.DetallePedido)
                    .ThenInclude(d => d.Producto)
                .Include(p => p.Devoluciones) // <-- AÑADE ESTA LÍNEA para incluir las devoluciones
                            .ThenInclude(d => d.DetalleDevolucion) // <-- AÑADE ESTO para incluir los items devueltos
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();
        }

        // --- AÑADIDO: Endpoint para actualizar el estado de un pedido ---
        // PUT: api/pedidos/5/estado
        [HttpPut("{id}/estado")]
        [Authorize(Roles = "Administrador,Operador")]
        public async Task<IActionResult> UpdatePedidoStatus(long id, [FromBody] PedidoEstadoUpdateDto dto)
        {
            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null)
            {
                return NotFound();
            }

            pedido.Estado = dto.Estado;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Clase DTO para recibir el nuevo estado
        public class PedidoEstadoUpdateDto
        {
            public string Estado { get; set; } = string.Empty;
        }


        [HttpPost]
        [Authorize(Roles = "Cliente")] // Solo los clientes pueden crear pedidos en línea
        public async Task<IActionResult> CrearPedido([FromBody] PedidoRequestDto pedidoDto)
        {
            if (pedidoDto.Items == null || !pedidoDto.Items.Any())
            {
                return BadRequest("El pedido debe tener al menos un producto.");
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Obtenemos el ID del usuario directamente del token JWT
                var usuarioId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                decimal montoTotal = 0;
                var detallesPedido = new List<DetallePedido>();

                foreach (var itemDto in pedidoDto.Items)
                {
                    var producto = await _context.Productos.FindAsync(itemDto.ProductoId);
                    if (producto == null || !producto.EstaActivo)
                    {
                        return NotFound($"El producto con ID {itemDto.ProductoId} no existe o está inactivo.");
                    }
                    if (producto.CantidadStock < itemDto.Cantidad)
                    {
                        return BadRequest($"Stock insuficiente para '{producto.Nombre}'.");
                    }

                    // Disminuimos el stock
                    producto.CantidadStock -= itemDto.Cantidad;

                    // Aplicamos lógica de precio mayorista si corresponde
                    decimal precioCompra = producto.Precio;
                    if (producto.CantidadMayorista.HasValue && itemDto.Cantidad >= producto.CantidadMayorista.Value && producto.PrecioMayorista.HasValue)
                    {
                        precioCompra = producto.PrecioMayorista.Value;
                    }

                    montoTotal += precioCompra * itemDto.Cantidad;
                    detallesPedido.Add(new DetallePedido
                    {
                        ProductoId = itemDto.ProductoId,
                        Cantidad = itemDto.Cantidad,
                        PrecioCompra = precioCompra
                    });
                }

                var nuevoPedido = new Pedido
                {
                    UsuarioId = usuarioId,
                    MontoTotal = montoTotal,
                    Estado = "Pendiente", // Un nuevo pedido online empieza como 'Pendiente'
                    FechaCreacion = DateTime.UtcNow,
                    TipoVenta = "EnLinea",
                    DetallePedido = detallesPedido
                };

                _context.Pedidos.Add(nuevoPedido);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(nuevoPedido);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Ocurrió un error inesperado al procesar el pedido.");
            }
        }
    }
}
