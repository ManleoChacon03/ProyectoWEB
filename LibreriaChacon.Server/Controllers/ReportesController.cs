using LibreriaChacon.Server.Contexts;
using LibreriaChacon.Server.Documents;
using LibreriaChacon.Server.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using System.Drawing;

namespace LibreriaChacon.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Administrador")] // Solo el admin puede ver los reportes
    public class ReportesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/reportes/ventas?fechaInicio=...&fechaFin=...&tipoVenta=...
        [HttpGet("ventas")]
        public async Task<ActionResult<IEnumerable<ReporteVentaDto>>> GetReporteVentas(
            [FromQuery] DateTime fechaInicio,
            [FromQuery] DateTime fechaFin,
            [FromQuery] string? tipoVenta)
        {
            var resultado = await ObtenerDatosReporte(fechaInicio, fechaFin, tipoVenta);
            return Ok(resultado);
        }

        // GET: api/reportes/ventas/excel?fechaInicio=...&fechaFin=...&tipoVenta=...
        [HttpGet("ventas/excel")]
        public async Task<IActionResult> GetReporteVentasExcel(
            [FromQuery] DateTime fechaInicio,
            [FromQuery] DateTime fechaFin,
            [FromQuery] string? tipoVenta)
        {
            var ventas = await ObtenerDatosReporte(fechaInicio, fechaFin, tipoVenta);

            byte[] fileBytes; // Variable para guardar el archivo en memoria
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Reporte de Ventas");

                // --- Encabezados (sin cambios) ---
                var headers = new string[] { "Pedido #", "Fecha", "Tipo", "Vendido Por", "Cliente", "NIT", "# Items", "Monto Total" };
                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[1, i + 1].Value = headers[i];
                    worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                    worksheet.Cells[1, i + 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    worksheet.Cells[1, i + 1].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                }

                // --- Datos ---
                if (ventas.Any())
                {
                    // Mapeamos los datos para que coincidan con el orden de los encabezados
                    var dataForExcel = ventas.Select(v => new {
                        v.PedidoId,
                        v.FechaVenta,
                        v.TipoVenta,
                        v.VendidoPor,
                        v.ClienteNombre,
                        v.ClienteNit,
                        v.TotalItems,
                        v.MontoTotal
                    }).ToList();

                    worksheet.Cells["A2"].LoadFromCollection(dataForExcel, false);
                }

                // --- Formato de Columnas ---
                worksheet.Cells["B:B"].Style.Numberformat.Format = "dd-mm-yyyy hh:mm";
                worksheet.Cells["H:H"].Style.Numberformat.Format = "\"Q\"#,##0.00";
                worksheet.Cells.AutoFitColumns();

                fileBytes = package.GetAsByteArray();
            }

            string excelName = $"ReporteVentas-{DateTime.Now:yyyyMMddHHmmss}.xlsx";

            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelName);
        }

        [HttpGet("ventas/pdf")]
        public async Task<IActionResult> GetReporteVentasPdf(
        [FromQuery] DateTime fechaInicio,
        [FromQuery] DateTime fechaFin,
        [FromQuery] string? tipoVenta)
        {
            // Usamos el mismo método privado para obtener los datos
            var ventas = await ObtenerDatosReporte(fechaInicio, fechaFin, tipoVenta);

            // Creamos una instancia de nuestra plantilla de documento
            var document = new ReporteVentasDocument(ventas, fechaInicio, fechaFin);

            // Generamos el PDF en memoria como un array de bytes
            var pdfBytes = document.GeneratePdf();

            string pdfName = $"ReporteVentas-{DateTime.Now:yyyyMMddHHmmss}.pdf";

            return File(pdfBytes, "application/pdf", pdfName);
        }

        // --- MÉTODO PRIVADO REUTILIZABLE ---
        private async Task<List<ReporteVentaDto>> ObtenerDatosReporte(DateTime fechaInicio, DateTime fechaFin, string? tipoVenta)
        {
            var query = _context.Pedidos
                .Include(p => p.Usuario)
                .Include(p => p.DetallePedido)
                .AsQueryable();

            fechaFin = fechaFin.Date.AddDays(1).AddTicks(-1);
            query = query.Where(p => p.FechaCreacion >= fechaInicio && p.FechaCreacion <= fechaFin);

            if (!string.IsNullOrEmpty(tipoVenta) && tipoVenta != "Todas")
            {
                query = query.Where(p => p.TipoVenta == tipoVenta);
            }

            var pedidos = await query.OrderByDescending(p => p.FechaCreacion).ToListAsync();

            var resultado = pedidos.Select(p => new ReporteVentaDto
            {
                PedidoId = p.Id,
                FechaVenta = p.FechaCreacion,
                TipoVenta = p.TipoVenta,
                VendidoPor = p.Usuario.NombreCompleto ?? "N/A",
                ClienteNombre = p.ClienteNombre ?? (p.TipoVenta == "EnLinea" ? p.Usuario.NombreCompleto ?? "N/A" : "N/A"),
                ClienteNit = p.ClienteNit ?? p.Usuario.Nit ?? "N/A",
                TotalItems = p.DetallePedido.Sum(d => d.Cantidad),
                MontoTotal = p.MontoTotal
            }).ToList();

            return resultado;
        }
    }
}