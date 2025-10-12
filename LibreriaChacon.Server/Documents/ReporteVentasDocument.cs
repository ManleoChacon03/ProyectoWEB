using LibreriaChacon.Server.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace LibreriaChacon.Server.Documents
{
    // En Documents/ReporteVentasDocument.cs
  

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
                // --- Tabla de Ventas ---
                column.Item().Table(table =>
                {
                    // Encabezados de la tabla
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(50);
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                        columns.RelativeColumn();
                    });

                    table.Header(header =>
                    {
                        header.Cell().Text("Pedido #");
                        header.Cell().Text("Fecha");
                        header.Cell().Text("Tipo");
                        header.Cell().Text("Cliente");
                        header.Cell().AlignRight().Text("Monto Total");
                    });

                    // Filas de datos
                    foreach (var venta in _ventas)
                    {
                        table.Cell().Text(venta.PedidoId);
                        table.Cell().Text($"{venta.FechaVenta:dd/MM/yyyy}");
                        table.Cell().Text(venta.TipoVenta);
                        table.Cell().Text(venta.ClienteNombre);
                        table.Cell().AlignRight().Text($"Q{venta.MontoTotal:N2}");
                    }
                });

                // --- Total General ---
                var totalGeneral = _ventas.Sum(v => v.MontoTotal);
                column.Item().AlignRight().PaddingTop(20).Text($"Total General: Q{totalGeneral:N2}").SemiBold().FontSize(14);
            });
        }
    }
}
