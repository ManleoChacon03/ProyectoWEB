namespace LibreriaChacon.Server.Models
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("productos")] 
    public class Producto
    {
        [Key]
        public long Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Nombre { get; set; } = null!;

        public string? Descripcion { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Precio { get; set; }

        [Column("cantidad_stock")]
        public int CantidadStock { get; set; }

        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; }

        [Column("imagen_url")]
        public string? ImagenUrl { get; set; }

        [Column("esta_activo")]
        public bool EstaActivo { get; set; }

        [Column("precio_mayorista", TypeName = "decimal(18, 2)")] 
        public decimal? PrecioMayorista { get; set; }

        [Column("cantidad_mayorista")] 
        public int? CantidadMayorista { get; set; }

        [Column("costo", TypeName = "decimal(18, 2)")] 
        public decimal? Costo { get; set; }

        public ICollection<Categoria> Categorias { get; set; } = new List<Categoria>();
    }
}