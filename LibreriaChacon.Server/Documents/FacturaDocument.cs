using LibreriaChacon.Server.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Linq; 

public class FacturaDocument : IDocument
{
    private readonly Pedido _pedido;

    public FacturaDocument(Pedido pedido)
    {
        _pedido = pedido;
    }

    public void Compose(IDocumentContainer container)
    {
        container.Page(page =>
        {
            page.Margin(50);
            page.Header().Element(ComposeHeader);
            page.Content().Element(ComposeContent);
            page.Footer().AlignCenter().Text("Gracias por su compra.");
        });
    }

    void ComposeHeader(IContainer container)
    {
        var direccion = _pedido.Usuario.Direcciones?.FirstOrDefault();
        container.Row(row =>
        {
            row.RelativeItem().Column(col =>
            {
                col.Item().Text("Librería Chacón").SemiBold().FontSize(20);
                col.Item().Text("Factura No. " + _pedido.Id);
                col.Item().Text($"Fecha: {_pedido.FechaCreacion:dd/MM/yyyy}");
            });
            row.RelativeItem().Column(col =>
            {
                col.Item().AlignRight().Text("Cliente:").SemiBold();
                col.Item().AlignRight().Text(_pedido.Usuario.NombreCompleto);
                col.Item().AlignRight().Text($"NIT: {_pedido.Usuario.Nit ?? "C/F"}");
                if (direccion != null)
                {
                    col.Item().AlignRight().Text(direccion.DireccionLinea1);
                    if (!string.IsNullOrEmpty(direccion.DireccionLinea2))
                        col.Item().AlignRight().Text(direccion.DireccionLinea2);
                    col.Item().AlignRight().Text(direccion.Departamento);
                }
            });
        });
    }

    void ComposeContent(IContainer container)
    {
        container.PaddingVertical(40).Column(column =>
        {
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(3); // Nombre del producto
                    columns.RelativeColumn();    // Cantidad
                    columns.RelativeColumn();    // Precio Unit.
                    columns.RelativeColumn();    // Subtotal
                });

                table.Header(header =>
                {
                    header.Cell().Text("Descripción");
                    header.Cell().AlignCenter().Text("Cantidad");
                    header.Cell().AlignRight().Text("Precio Unitario");
                    header.Cell().AlignRight().Text("Subtotal");
                });

                foreach (var item in _pedido.DetallePedido)
                {
                    // 1. Calculamos la cantidad devuelta para ESTE item
                    var cantidadDevuelta = _pedido.Devoluciones
                        .Where(d => d.Estado == "Aprobada")
                        .SelectMany(d => d.DetalleDevolucion)
                        .Where(dd => dd.ProductoId == item.Producto.Id)
                        .Sum(dd => dd.Cantidad);

                    // 2. Calculamos la cantidad neta que el cliente se quedó
                    var cantidadNeta = item.Cantidad - cantidadDevuelta;

                    // 3. Solo mostramos el item en la factura si la cantidad neta es mayor a 0
                    if (cantidadNeta > 0)
                    {
                        table.Cell().Text(item.Producto.Nombre);
                        table.Cell().AlignCenter().Text(cantidadNeta); 
                        table.Cell().AlignRight().Text($"Q{item.PrecioCompra:N2}");
                        table.Cell().AlignRight().Text($"Q{cantidadNeta * item.PrecioCompra:N2}"); 
                    }
                }
            });

            var montoDevuelto = _pedido.Devoluciones
                .Where(d => d.Estado == "Aprobada")
                .Sum(d => d.MontoReembolsado ?? 0);

            var ventaNeta = _pedido.MontoTotal - montoDevuelto;

            column.Item().AlignRight().PaddingTop(20).Column(col =>
            {
                col.Item().Text($"Subtotal: Q{_pedido.MontoTotal:N2}");
                if (montoDevuelto > 0)
                {
                    col.Item().Text($"Devoluciones: -Q{montoDevuelto:N2}");
                    col.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                }
                col.Item().Text($"Total: Q{ventaNeta:N2}").SemiBold().FontSize(14);
            });
        });
    }
}