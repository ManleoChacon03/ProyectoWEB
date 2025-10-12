// En Controllers/VentasController.cs
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
    [Authorize] // Protegemos todo el controlador para que solo usuarios logueados puedan acceder
    public class VentasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VentasController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("tienda")]
        [Authorize(Roles = "Administrador,Operador")] // Solo Admins y Operadores pueden registrar una venta en tienda
        public async Task<IActionResult> RegistrarVentaEnTienda([FromBody] VentaRequestDto ventaDto)
        {
            if (ventaDto.Items == null || !ventaDto.Items.Any())
            {
                return BadRequest("La venta debe tener al menos un producto.");
            }

            // Usamos una transacción para asegurar que todas las operaciones se completen o ninguna lo haga.
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

                    // Disminuimos el stock
                    producto.CantidadStock -= itemDto.Cantidad;

                    // --- LÓGICA DE PRECIO MAYORISTA AÑADIDA ---
                    decimal precioCompra = producto.Precio; // Precio por defecto
                                                            // Verificamos si hay una regla de mayoreo y si la cantidad de la venta la cumple
                    if (producto.CantidadMayorista.HasValue && itemDto.Cantidad >= producto.CantidadMayorista.Value)
                    {
                        // Si además hay un precio mayorista definido, lo usamos
                        if (producto.PrecioMayorista.HasValue)
                        {
                            precioCompra = producto.PrecioMayorista.Value;
                        }
                    }
                    // -----------------------------------------

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
                    UsuarioId = operadorId, // Guardamos el ID del operador que realizó la venta
                    MontoTotal = montoTotal,
                    Estado = "Completado", // Las ventas en tienda se completan al instante
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
                // En un caso real, aquí se registraría el error 'ex' en un sistema de logs
                return StatusCode(500, "Ocurrió un error inesperado al procesar la venta.");
            }
        }
    }
}
