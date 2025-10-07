// En Models/Devolucion.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibreriaChacon.Server.Models
{
    [Table("devoluciones")]
    public class Devolucion
    {
        [Key]
        public long Id { get; set; }

        [Column("pedido_id")]
        public long PedidoId { get; set; }

        [Column("usuario_id")]
        public Guid UsuarioId { get; set; }

        [Required]
        public string Motivo { get; set; } = null!;

        [Required]
        public string Estado { get; set; } = null!;

        [Column("fecha_solicitud")]
        public DateTime FechaSolicitud { get; set; }

        public Pedido Pedido { get; set; } = null!;
        public Perfil Usuario { get; set; } = null!;
    }
}
