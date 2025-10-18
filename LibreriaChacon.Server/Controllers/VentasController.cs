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
    public class VentasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VentasController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("tienda")]
        [Authorize(Roles = "Administrador,Operador")] 
        public async Task<IActionResult> RegistrarVentaEnTienda([FromBody] VentaRequestDto ventaDto)
        {
            if (ventaDto.Items == null || !ventaDto.Items.Any())
            {
                return BadRequest("La venta debe tener al menos un producto.");
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var operadorId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                decimal montoTotal = 0;
                var detallesPedido = new List<DetallePedido>();

                foreach (var itemDto in ventaDto.Items)
                {
                    var producto = await _context.Productos.FindAsync(itemDto.ProductoId);
                    if (producto == null || !producto.EstaActivo)
                    {
                        await transaction.RollbackAsync();
                        return NotFound($"El producto con ID {itemDto.ProductoId} no existe o está inactivo.");
                    }

                    if (producto.CantidadStock < itemDto.Cantidad)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest($"Stock insuficiente para '{producto.Nombre}'. Disponible: {producto.CantidadStock}, Solicitado: {itemDto.Cantidad}.");
                    }

                    producto.CantidadStock -= itemDto.Cantidad;

                    //  LÓGICA DE PRECIO MAYORISTA 
                    decimal precioCompra = producto.Precio; // Precio por defecto
                    if (producto.CantidadMayorista.HasValue && itemDto.Cantidad >= producto.CantidadMayorista.Value)
                    {
                        // Si además hay un precio mayorista definido, lo usamos
                        if (producto.PrecioMayorista.HasValue)
                        {
                            precioCompra = producto.PrecioMayorista.Value;
                        }
                    }

                    montoTotal += precioCompra * itemDto.Cantidad;

                    detallesPedido.Add(new DetallePedido
                    {
                        ProductoId = itemDto.ProductoId,
                        Cantidad = itemDto.Cantidad,
                        PrecioCompra = precioCompra // Guardamos el precio que se usó (sea normal o mayorista)
                    });
                }

                // Creamos el pedido principal
                var nuevoPedido = new Pedido
                {
                    UsuarioId = operadorId, 
                    MontoTotal = montoTotal,
                    Estado = "Completado", 
                    FechaCreacion = DateTime.UtcNow,
                    TipoVenta = "EnTienda",
                    ClienteNit = ventaDto.ClienteNit,
                    ClienteNombre = ventaDto.ClienteNombre,
                    DetallePedido = detallesPedido
                };

                _context.Pedidos.Add(nuevoPedido);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(nuevoPedido);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Ocurrió un error inesperado al procesar la venta.");
            }
        }
    }
}
