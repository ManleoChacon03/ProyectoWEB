using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibreriaChacon.Server.Models
{
    [Table("pedidos")]
    public class Pedido
    {
        [Key]
        public long Id { get; set; }
        [Column("usuario_id")]
        public Guid UsuarioId { get; set; }
        [Column("monto_total", TypeName = "decimal(18, 2)")]
        public decimal MontoTotal { get; set; }
        public string Estado { get; set; } = null!;
        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; }
        [Column("tipo_venta")]
        public string TipoVenta { get; set; } = null!; // Nueva propiedad

        public Perfil Usuario { get; set; } = null!;
        public ICollection<DetallePedido> DetallePedido { get; set; } = new List<DetallePedido>();
    }
}
