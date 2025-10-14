using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibreriaChacon.Server.Models
{

    [Table("direcciones")]
    public class Direccion
    {
        [Key]
        public long Id { get; set; }

        [Column("usuario_id")]
        public Guid UsuarioId { get; set; }

        [Required]
        [Column("direccion_linea1")]
        public string DireccionLinea1 { get; set; } = null!;

        [Column("direccion_linea2")]
        public string? DireccionLinea2 { get; set; }

        [Required]
        public string Ciudad { get; set; } = null!;

        public string? Departamento { get; set; }

        [Column("monto_reembolsado", TypeName = "decimal(18, 2)")] // <-- AÑADIDO
        public decimal? MontoReembolsado { get; set; }

        [Column("fecha_procesamiento")] // <-- AÑADIDO
        public DateTime? FechaProcesamiento { get; set; }

        [Column("codigo_postal")]
        public string? CodigoPostal { get; set; }

        [Required]
        public string Pais { get; set; } = null!;

        public Perfil Usuario { get; set; } = null!;
    }
}
