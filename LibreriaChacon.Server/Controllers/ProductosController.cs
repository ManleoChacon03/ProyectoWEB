using LibreriaChacon.Server.Contexts;
using LibreriaChacon.Server.DTOs;
using LibreriaChacon.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibreriaChacon.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductosController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/productos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Producto>>> GetProductos()
        {
            return await _context.Productos.Where(p => p.EstaActivo).Include(p => p.Categorias).ToListAsync();
        }

        // GET: api/productos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Producto>> GetProducto(long id)
        {
            var producto = await _context.Productos
                .Where(p => p.EstaActivo)
                .Include(p => p.Categorias)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (producto == null)
            {
                return NotFound();
            }

            return producto;
        }

        // POST: api/productos
        [HttpPost]
        public async Task<ActionResult<Producto>> PostProducto(ProductoDto productoDto)
        {
            var categoriasDelProducto = await _context.Categorias
                .Where(c => productoDto.CategoriaIds.Contains(c.Id))
                .ToListAsync();

            var nuevoProducto = new Producto
            {
                Nombre = productoDto.Nombre,
                Descripcion = productoDto.Descripcion,
                Precio = productoDto.Precio,
                CantidadStock = productoDto.CantidadStock,
                FechaCreacion = DateTime.UtcNow,
                ImagenUrl = productoDto.ImagenUrl,
                Categorias = categoriasDelProducto,
                EstaActivo = true, 
                PrecioMayorista = productoDto.PrecioMayorista,
                CantidadMayorista = productoDto.CantidadMayorista,
                Costo = productoDto.Costo 

            };

            _context.Productos.Add(nuevoProducto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProducto), new { id = nuevoProducto.Id }, nuevoProducto);
        }

        // PUT: api/productos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProducto(long id, ProductoDto productoDto)
        {
            var productoAActualizar = await _context.Productos
                .Include(p => p.Categorias)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (productoAActualizar == null)
            {
                return NotFound();
            }

            productoAActualizar.Nombre = productoDto.Nombre;
            productoAActualizar.Descripcion = productoDto.Descripcion;
            productoAActualizar.Precio = productoDto.Precio;
            productoAActualizar.CantidadStock = productoDto.CantidadStock;
            productoAActualizar.ImagenUrl = productoDto.ImagenUrl;
            productoAActualizar.PrecioMayorista = productoDto.PrecioMayorista;
            productoAActualizar.CantidadMayorista = productoDto.CantidadMayorista;
            productoAActualizar.Costo = productoDto.Costo; 


            var nuevasCategorias = await _context.Categorias
                .Where(c => productoDto.CategoriaIds.Contains(c.Id))
                .ToListAsync();

            productoAActualizar.Categorias = nuevasCategorias;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/productos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProducto(long id)
        {
            var productoEnPedidos = await _context.DetallePedido.AnyAsync(d => d.ProductoId == id);
            if (productoEnPedidos)
            {
                return BadRequest("No se puede desactivar el producto porque está asociado a pedidos existentes.");
            }

            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
            {
                return NotFound();
            }

            producto.EstaActivo = false;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/productos/inactivos
        [HttpGet("inactivos")]
        public async Task<ActionResult<IEnumerable<Producto>>> GetProductosInactivos()
        {
            return await _context.Productos
                .Where(p => !p.EstaActivo)
                .Include(p => p.Categorias)
                .ToListAsync();
        }

        // POST: api/productos/5/reactivar
        [HttpPost("{id}/reactivar")]
        public async Task<IActionResult> ReactivarProducto(long id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
            {
                return NotFound();
            }

            producto.EstaActivo = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}