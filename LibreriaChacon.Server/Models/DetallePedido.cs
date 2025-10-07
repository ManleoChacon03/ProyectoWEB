using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibreriaChacon.Server.Models
{
    [Table("detalle_pedido")]
    public class DetallePedido
    {
        [Key]
        public long Id { get; set; }
        [Column("pedido_id")]
        public long PedidoId { get; set; }
        [Column("producto_id")]
        public long ProductoId { get; set; }
        public int Cantidad { get; set; }
        [Column("precio_compra", TypeName = "decimal(18, 2)")]
        public decimal PrecioCompra { get; set; }

        public Pedido Pedido { get; set; } = null!;
        public Producto Producto { get; set; } = null!;
    }
}
