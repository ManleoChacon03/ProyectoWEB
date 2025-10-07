namespace LibreriaChacon.Server.Models
{
    // En Models/Categoria.cs
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

        // --- Propiedad de Navegación ---
        // Esta es la otra parte de la relación.
        // Una categoría puede tener muchos productos.
        public ICollection<Producto> Productos { get; set; } = new List<Producto>();
    }
}
