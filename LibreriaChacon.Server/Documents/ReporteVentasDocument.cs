using LibreriaChacon.Server.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace LibreriaChacon.Server.Documents
{
    public class ReporteVentasDocument : IDocument
    {
        private readonly List<ReporteVentaDto> _ventas;
        private readonly DateTime _fechaInicio;
        private readonly DateTime _fechaFin;

        public ReporteVentasDocument(List<ReporteVentaDto> ventas, DateTime fechaInicio, DateTime fechaFin)
        {
            _ventas = ventas;
            _fechaInicio = fechaInicio;
            _fechaFin = fechaFin;
        }

        public void Compose(IDocumentContainer container)
        {
            container
                .Page(page =>
                {
                    page.Margin(50);
                    page.Header().Element(ComposeHeader);
                    page.Content().Element(ComposeContent);
                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.CurrentPageNumber();
                        x.Span(" / ");
                        x.TotalPages();
                    });
                });
        }

        void ComposeHeader(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("Reporte de Ventas").SemiBold().FontSize(20);
                    column.Item().Text($"Del: {_fechaInicio:dd/MM/yyyy} al {_fechaFin:dd/MM/yyyy}");
                    column.Item().Text($"Generado el: {DateTime.Now:dd/MM/yyyy HH:mm}");
                });
            });
        }

        void ComposeContent(IContainer container)
        {
            container.PaddingVertical(40).Column(column =>
            {
                // --- Tabla de Ventas (Adaptada) ---
                column.Item().Table(table =>
                {
                    // Encabezados de la tabla
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(40); // Pedido #
                        columns.RelativeColumn();   // Fecha
                        columns.RelativeColumn();   // Cliente
                        columns.RelativeColumn();   // Monto Total
                        columns.RelativeColumn();   // Monto Devuelto
                        columns.RelativeColumn();   // Venta Neta
                        columns.RelativeColumn();   // IVA
                        columns.RelativeColumn();   // Ganancia
                    });

                    table.Header(header =>
                    {
                        header.Cell().Text("Pedido #");
                        header.Cell().Text("Fecha");
                        header.Cell().Text("Cliente");
                        header.Cell().AlignRight().Text("Total");
                        header.Cell().AlignRight().Text("Devuelto");
                        header.Cell().AlignRight().Text("Venta Neta");
                        header.Cell().AlignRight().Text("IVA");
                        header.Cell().AlignRight().Text("Ganancia");
                    });

                    // Filas de datos
                    foreach (var venta in _ventas)
                    {
                        table.Cell().Text(venta.PedidoId);
                        table.Cell().Text($"{venta.FechaVenta:dd/MM/yyyy}");
                        table.Cell().Text(venta.ClienteNombre);
                        table.Cell().AlignRight().Text($"Q{venta.MontoTotal:N2}");
                        table.Cell().AlignRight().Text($"-Q{venta.MontoDevuelto:N2}");
                        table.Cell().AlignRight().Text($"Q{venta.VentaNeta:N2}");
                        table.Cell().AlignRight().Text($"Q{venta.Iva:N2}");
                        table.Cell().AlignRight().Text($"Q{venta.Ganancia:N2}");
                    }
                });

                // --- Totales del Reporte (Adaptado) ---
                var totalVentaBruta = _ventas.Sum(v => v.MontoTotal);
                var totalDevoluciones = _ventas.Sum(v => v.MontoDevuelto);
                var totalVentaNeta = _ventas.Sum(v => v.VentaNeta);
                var totalGanancia = _ventas.Sum(v => v.Ganancia);

                column.Item().AlignRight().PaddingTop(20).Column(col =>
                {
                    col.Item().Text($"Total Venta Bruta: Q{totalVentaBruta:N2}");
                    col.Item().Text($"Total Devoluciones: -Q{totalDevoluciones:N2}");
                    col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    col.Item().Text($"Total Venta Neta: Q{totalVentaNeta:N2}").SemiBold();
                    col.Item().Text($"Ganancia Total: Q{totalGanancia:N2}").SemiBold().FontSize(14);
                });
            });
        }
    }
}