using LibreriaChacon.Server.Contexts;
using LibreriaChacon.Server.Documents; 
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Administrador,Operador")]
public class InventarioController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public InventarioController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/inventario
    [HttpGet]
    public async Task<IActionResult> GetInventario()
    {
        var productos = await _context.Productos
            .Where(p => p.EstaActivo)
            .Include(p => p.Categorias)
            .OrderBy(p => p.Nombre)
            .ToListAsync();

        return Ok(productos);
    }

    // GET: api/inventario/pdf
    [HttpGet("pdf")]
    public async Task<IActionResult> GetInventarioPdf()
    {
        var productos = await _context.Productos
            .Where(p => p.EstaActivo)
            .Include(p => p.Categorias)
            .OrderBy(p => p.Nombre)
            .ToListAsync();

        var document = new InventarioDocument(productos);
        var pdfBytes = document.GeneratePdf();
        string pdfName = $"Inventario-{DateTime.Now:yyyyMMdd}.pdf";

        return File(pdfBytes, "application/pdf", pdfName);
    }
}