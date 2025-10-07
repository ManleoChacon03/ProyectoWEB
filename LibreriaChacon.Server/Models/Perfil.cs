namespace LibreriaChacon.Server.Models
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    [Table("perfiles")] // <-- ADAPTACIÓN: Añadimos el nombre de la tabla para ser explícitos
    public class Perfil
    {
        [Key]
        public Guid Id { get; set; }

        [Display(Name = "Nombre completo")]
        [StringLength(255)]
        [Column("nombre_completo")]
        public string? NombreCompleto { get; set; } // Correcto: permite nulos

        [Required(ErrorMessage = "El correo electrónico es obligatorio.")]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = null!;

        [Required]
        [Column("password")]
        public string Password { get; set; } = null!;

        [Display(Name = "URL del Avatar")]
        [Column("url_avatar")]
        public string? UrlAvatar { get; set; } // Correcto: permite nulos

        [Required]
        [StringLength(50)]
        public string Rol { get; set; } = null!;

        [Display(Name = "Fecha de creación")]
        [Column("fecha_creacion")]
        public DateTime FechaCreacion { get; set; }
    }
}