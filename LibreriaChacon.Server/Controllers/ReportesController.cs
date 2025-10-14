// En Controllers/ReportesController.cs
using LibreriaChacon.Server.Contexts;
using LibreriaChacon.Server.Documents;
using LibreriaChacon.Server.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using QuestPDF.Fluent;
using System.Drawing;

namespace LibreriaChacon.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Administrador")]
    public class ReportesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("ventas")]
        public async Task<ActionResult<IEnumerable<ReporteVentaDto>>> GetReporteVentas(
            [FromQuery] DateTime fechaInicio, [FromQuery] DateTime fechaFin, [FromQuery] string? tipoVenta)
        {
            var resultado = await ObtenerDatosReporte(fechaInicio, fechaFin, tipoVenta);
            return Ok(resultado);
        }

        [HttpGet("ventas/excel")]
        public async Task<IActionResult> GetReporteVentasExcel(
            [FromQuery] DateTime fechaInicio, [FromQuery] DateTime fechaFin, [FromQuery] string? tipoVenta)
        {
            var ventas = await ObtenerDatosReporte(fechaInicio, fechaFin, tipoVenta);
            byte[] fileBytes;
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Reporte de Ventas");
                // --- Encabezados Actualizados ---
                var headers = new string[] { "Pedido #", "Fecha", "Tipo", "Vendido Por", "Cliente", "NIT", "# Items", "Monto Total", "Monto Devuelto", "Venta Neta", "IVA", "Ganancia" };
                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cells[1, i + 1].Value = headers[i];
                    worksheet.Cells[1, i + 1].Style.Font.Bold = true;
                }

                if (ventas.Any())
                {
                    // --- Datos para Excel Actualizados ---
                    var dataForExcel = ventas.Select(v => new { v.PedidoId, v.FechaVenta, v.TipoVenta, v.VendidoPor, v.ClienteNombre, v.ClienteNit, v.TotalItems, v.MontoTotal, v.MontoDevuelto, VentaNeta = v.VentaNeta, v.Iva, v.Ganancia }).ToList();
                    worksheet.Cells["A2"].LoadFromCollection(dataForExcel, false);
                }

                worksheet.Cells["B:B"].Style.Numberformat.Format = "dd-mm-yyyy hh:mm";
                worksheet.Cells["H:L"].Style.Numberformat.Format = "\"Q\"#,##0.00"; // Columnas de moneda
                worksheet.Cells.AutoFitColumns();
                fileBytes = package.GetAsByteArray();
            }

            string excelName = $"ReporteVentas-{DateTime.Now:yyyyMMddHHmmss}.xlsx";
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelName);
        }

        [HttpGet("ventas/pdf")]
        public async Task<IActionResult> GetReporteVentasPdf(
            [FromQuery] DateTime fechaInicio, [FromQuery] DateTime fechaFin, [FromQuery] string? tipoVenta)
        {
            var ventas = await ObtenerDatosReporte(fechaInicio, fechaFin, tipoVenta);
            var document = new ReporteVentasDocument(ventas, fechaInicio, fechaFin);
            var pdfBytes = document.GeneratePdf();
            string pdfName = $"ReporteVentas-{DateTime.Now:yyyyMMddHHmmss}.pdf";
            return File(pdfBytes, "application/pdf", pdfName);
        }

        // --- MÉTODO PRIVADO CON LA LÓGICA DE GANANCIA CORREGIDA ---
        private async Task<List<ReporteVentaDto>> ObtenerDatosReporte(DateTime fechaInicio, DateTime fechaFin, string? tipoVenta)
        {
            fechaFin = fechaFin.Date.AddDays(1).AddTicks(-1);

            var query = _context.Pedidos
                .Include(p => p.Usuario)
                .Include(p => p.DetallePedido)
                    .ThenInclude(d => d.Producto) // <-- Incluimos el producto para obtener su COSTO
                .Where(p => p.FechaCreacion >= fechaInicio && p.FechaCreacion <= fechaFin);

            if (!string.IsNullOrEmpty(tipoVenta) && tipoVenta != "Todas")
            {
                query = query.Where(p => p.TipoVenta == tipoVenta);
            }

            var pedidos = await query.OrderByDescending(p => p.FechaCreacion).ToListAsync();

            var pedidoIds = pedidos.Select(p => p.Id).ToList();

            var devolucionesAprobadas = await _context.Devoluciones
                .Include(d => d.DetalleDevolucion)
                    .ThenInclude(dd => dd.Producto) // <-- Incluimos el producto para obtener el COSTO de lo devuelto
                .Where(d => d.Estado == "Aprobada" && pedidoIds.Contains(d.PedidoId))
                .ToListAsync();

            var resultado = pedidos.Select(p =>
            {
                var montoDevuelto = devolucionesAprobadas
                    .Where(d => d.PedidoId == p.Id)
                    .Sum(d => d.MontoReembolsado ?? 0);

                var ventaNeta = p.MontoTotal - montoDevuelto;
                var montoSinIva = ventaNeta / 1.12m;
                var iva = ventaNeta - montoSinIva;

                // --- ESTA ES LA LÓGICA DE GANANCIA QUE SE AJUSTA A TU NEGOCIO ---
                var costoTotalOriginal = p.DetallePedido.Sum(d => (d.Producto.Costo ?? 0) * d.Cantidad);

                var devolucionesDeEstePedido = devolucionesAprobadas.Where(d => d.PedidoId == p.Id);

                var costoTotalDevuelto = devolucionesDeEstePedido
                    .SelectMany(d => d.DetalleDevolucion)
                    .Sum(dd => (dd.Producto.Costo ?? 0) * dd.Cantidad);

                var costoNeto = costoTotalOriginal - costoTotalDevuelto;

                var ganancia = montoSinIva - costoNeto;

                return new ReporteVentaDto
                {
                    PedidoId = p.Id,
                    FechaVenta = p.FechaCreacion,
                    TipoVenta = p.TipoVenta,
                    VendidoPor = p.Usuario.NombreCompleto ?? "N/A",
                    ClienteNombre = p.ClienteNombre ?? (p.TipoVenta == "EnLinea" ? p.Usuario.NombreCompleto ?? "N/A" : "N/A"),
                    ClienteNit = p.ClienteNit ?? p.Usuario.Nit ?? "N/A",
                    TotalItems = p.DetallePedido.Sum(d => d.Cantidad),
                    MontoTotal = p.MontoTotal,
                    MontoDevuelto = montoDevuelto,
                    Iva = iva,
                    Ganancia = ganancia
                };
            }).ToList();

            return resultado;
        }
    }
}