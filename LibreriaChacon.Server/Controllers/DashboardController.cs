// En Controllers/DashboardController.cs
using LibreriaChacon.Server.Contexts;
using LibreriaChacon.Server.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibreriaChacon.Server.Controllers
{
   

    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetStats()
        {
            var stats = new DashboardStatsDto
            {
                TotalProductos = await _context.Productos.CountAsync(),
                TotalClientes = await _context.Perfiles.CountAsync(p => p.Rol == "Cliente"),
                ProductosBajoStock = await _context.Productos.CountAsync(p => p.CantidadStock < 10),
                TotalPedidos = await _context.Pedidos.CountAsync()
            };
            return Ok(stats);
        }
    }
}
