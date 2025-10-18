    // En Controllers/PedidosController.cs
    using LibreriaChacon.Server.Contexts;
    using LibreriaChacon.Server.DTOs;
    using LibreriaChacon.Server.Models;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using System.Security.Claims;
    using LibreriaChacon.Server.Documents; 
    using QuestPDF.Fluent;                

    namespace LibreriaChacon.Server.Controllers
    {
        [Route("api/[controller]")]
        [ApiController]
        [Authorize] 
        public class PedidosController : ControllerBase
        {
            private readonly ApplicationDbContext _context;

            public PedidosController(ApplicationDbContext context)
            {
                _context = context;
            }

            // GET: api/pedidos
            [HttpGet]
            [Authorize(Roles = "Administrador,Operador")]
            public async Task<ActionResult<IEnumerable<Pedido>>> GetAllPedidos()
            {
                return await _context.Pedidos
                    .Include(p => p.Usuario)
                    .Include(p => p.Devoluciones) 
                    .OrderByDescending(p => p.FechaCreacion)
                    .ToListAsync();
            }

            // GET: api/pedidos/11/factura
            [HttpGet("{id}/factura")]
            [Authorize(Roles = "Cliente")]
            public async Task<IActionResult> GetFacturaPdf(long id)
            {
                var usuarioId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

                // Hacemos una consulta muy completa para traer todos los datos necesarios para la factura
                var pedido = await _context.Pedidos
                    .Include(p => p.Usuario)
                        .ThenInclude(u => u.Direcciones) 
                    .Include(p => p.DetallePedido)
                        .ThenInclude(d => d.Producto)
                        .Include(p => p.Devoluciones) 
                    .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == usuarioId);

                if (pedido == null)
                {
                    return NotFound("Pedido no encontrado.");
                }

                var document = new FacturaDocument(pedido);
                var pdfBytes = document.GeneratePdf();
                string pdfName = $"Factura-Orden-{pedido.Id}.pdf";

                return File(pdfBytes, "application/pdf", pdfName);
            }

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
                    .Include(p => p.Devoluciones)
                        .ThenInclude(d => d.DetalleDevolucion)
                    .OrderByDescending(p => p.FechaCreacion)
                    .ToListAsync();
            }

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
            [Authorize(Roles = "Cliente")] 
            public async Task<IActionResult> CrearPedido([FromBody] PedidoRequestDto pedidoDto)
            {
                if (pedidoDto.Items == null || !pedidoDto.Items.Any())
                {
                    return BadRequest("El pedido debe tener al menos un producto.");
                }

                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
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

                        producto.CantidadStock -= itemDto.Cantidad;

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
                        Estado = "Pendiente",
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