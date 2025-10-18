namespace LibreriaChacon.Server.Documents
{
    using LibreriaChacon.Server.Models;
    using QuestPDF.Fluent;
    using QuestPDF.Infrastructure;
    using System.Linq;

    public class InventarioDocument : IDocument
    {
        private readonly List<Producto> _productos;

        public InventarioDocument(List<Producto> productos)
        {
            _productos = productos;
        }

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Margin(50);
                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
            });
        }

        void ComposeHeader(IContainer container)
        {
            container.Column(column =>
            {
                column.Item().Text("Reporte de Inventario").SemiBold().FontSize(20);
                column.Item().Text($"Generado el: {DateTime.Now:dd/MM/yyyy HH:mm}");
            });
        }

        void ComposeContent(IContainer container)
        {
            container.PaddingVertical(20).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(3); // Nombre
                    columns.RelativeColumn(2); // Categoría
                    columns.RelativeColumn();    // Stock
                    columns.RelativeColumn();    // Precio
                });

                table.Header(header =>
                {
                    header.Cell().Text("Nombre del Producto");
                    header.Cell().Text("Categoría");
                    header.Cell().AlignCenter().Text("Stock");
                    header.Cell().AlignRight().Text("Precio");
                });

                foreach (var producto in _productos)
                {
                    table.Cell().Text(producto.Nombre);
                    table.Cell().Text(producto.Categorias.FirstOrDefault()?.Nombre ?? "N/A");
                    table.Cell().AlignCenter().Text(producto.CantidadStock);
                    table.Cell().AlignRight().Text($"Q{producto.Precio:N2}");
                }
            });
        }
    }
}
