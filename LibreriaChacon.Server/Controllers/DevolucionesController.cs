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
    [Authorize]
    public class DevolucionesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DevolucionesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("{id}/aprobar")]
        [Authorize(Roles = "Administrador,Operador")]
        public async Task<IActionResult> AprobarDevolucion(long id)
        {
            var devolucion = await _context.Devoluciones
                .Include(d => d.DetalleDevolucion)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (devolucion == null) return NotFound();
            if (devolucion.Estado != "Solicitada") return BadRequest("Esta devolución ya ha sido procesada.");

            var detallesPedidoOriginal = await _context.DetallePedido
                .Where(dp => dp.PedidoId == devolucion.PedidoId)
                .ToListAsync();

            decimal montoAReembolsar = 0;

            foreach (var itemDevuelto in devolucion.DetalleDevolucion)
            {
                // Buscamos el producto para reingresar el stock
                var producto = await _context.Productos.FindAsync(itemDevuelto.ProductoId);
                if (producto != null)
                {
                    producto.CantidadStock += itemDevuelto.Cantidad;
                }

                // Calculamos el reembolso basado en el precio que se pagó originalmente
                var detalleOriginal = detallesPedidoOriginal.FirstOrDefault(dp => dp.ProductoId == itemDevuelto.ProductoId);
                if (detalleOriginal != null)
                {
                    montoAReembolsar += detalleOriginal.PrecioCompra * itemDevuelto.Cantidad;
                }
            }

            // Actualizamos el estado de la devolución
            devolucion.Estado = "Aprobada";
            devolucion.MontoReembolsado = montoAReembolsar;
            devolucion.FechaProcesamiento = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet]
        [Authorize(Roles = "Administrador,Operador")]
        public async Task<ActionResult<IEnumerable<Devolucion>>> GetDevoluciones()
        {
            return await _context.Devoluciones
                .Include(d => d.Usuario) // Incluimos los datos del cliente que solicitó
                .OrderByDescending(d => d.FechaSolicitud)
                .ToListAsync();
        }

        [HttpPost]
        [Authorize(Roles = "Cliente")]
        public async Task<IActionResult> SolicitarDevolucion([FromBody] DevolucionRequestDto devolucionDto)
        {
            if (devolucionDto.Items == null || !devolucionDto.Items.Any())
            {
                return BadRequest("Se debe seleccionar al menos un producto para devolver.");
            }

            var usuarioId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            // Verificamos que el pedido pertenezca al usuario
            var pedido = await _context.Pedidos
                .Include(p => p.DetallePedido)
                .FirstOrDefaultAsync(p => p.Id == devolucionDto.PedidoId && p.UsuarioId == usuarioId);

            if (pedido == null)
            {
                return NotFound("El pedido no fue encontrado o no pertenece al usuario.");
            }

            // Verificamos que los productos a devolver existan en el pedido original y la cantidad sea válida
            foreach (var itemDevolucion in devolucionDto.Items)
            {
                var itemOriginal = pedido.DetallePedido
                    .FirstOrDefault(d => d.ProductoId == itemDevolucion.ProductoId);

                if (itemOriginal == null || itemDevolucion.Cantidad > itemOriginal.Cantidad)
                {
                    return BadRequest($"La cantidad a devolver del producto ID {itemDevolucion.ProductoId} es inválida.");
                }
            }

            var nuevaDevolucion = new Devolucion
            {
                PedidoId = devolucionDto.PedidoId,
                UsuarioId = usuarioId,
                Motivo = devolucionDto.Motivo,
                Estado = "Solicitada", // Estado inicial
                FechaSolicitud = DateTime.UtcNow,
                DetalleDevolucion = devolucionDto.Items.Select(i => new DetalleDevolucion
                {
                    ProductoId = i.ProductoId,
                    Cantidad = i.Cantidad
                }).ToList()
            };

            _context.Devoluciones.Add(nuevaDevolucion);
            await _context.SaveChangesAsync();

            return Ok(nuevaDevolucion);
        }
    }
}
