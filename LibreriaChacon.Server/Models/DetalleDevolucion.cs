using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibreriaChacon.Server.Models
{
    // En Models/DetalleDevolucion.cs

    [Table("detalle_devolucion")]
    public class DetalleDevolucion
    {
        [Key]
        public long Id { get; set; }

        [Column("devolucion_id")]
        public long DevolucionId { get; set; }

        [Column("producto_id")]
        public long ProductoId { get; set; }

        public int Cantidad { get; set; }

        // Propiedades de navegación
        public Devolucion Devolucion { get; set; } = null!;
        public Producto Producto { get; set; } = null!;
    }
}
