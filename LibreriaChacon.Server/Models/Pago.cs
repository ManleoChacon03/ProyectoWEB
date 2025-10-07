// En Models/Pago.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibreriaChacon.Server.Models
{
    
    [Table("pagos")]
    public class Pago
    {
        [Key]
        public long Id { get; set; }

        [Column("pedido_id")]
        public long PedidoId { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Monto { get; set; }

        [Required]
        [Column("metodo_pago")]
        public string MetodoPago { get; set; } = null!;

        [Column("id_transaccion")]
        public string? IdTransaccion { get; set; }

        [Required]
        public string Estado { get; set; } = null!;

        [Column("fecha_pago")]
        public DateTime FechaPago { get; set; }

        public Pedido Pedido { get; set; } = null!;
    }
}
