namespace LibreriaChacon.Server.Models
{
    using System.ComponentModel.DataAnnotations;

    public class Categoria
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = null!;

        [StringLength(500)]
        public string? Descripcion { get; set; }

     
        public ICollection<Producto> Productos { get; set; } = new List<Producto>();
    }
}
