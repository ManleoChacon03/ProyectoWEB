// En Models/ReseñaProducto.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace LibreriaChacon.Server.Models
{
   
    [Table("reseñas_producto")]
    public class ReseñaProducto
    {
        [Key]
        public long Id { get; set; }

        [Column("producto_id")]
        public long ProductoId { get; set; }

        [Column("usuario_id")]
        public Guid UsuarioId { get; set; }

        [Range(1, 5)]
        public int Calificacion { get; set; }

        public string? Comentario { get; set; }

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; }

        public Producto Producto { get; set; } = null!;
        public Perfil Usuario { get; set; } = null!;
    }
}
