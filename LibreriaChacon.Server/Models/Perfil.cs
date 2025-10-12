// En Models/Perfil.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("perfiles")]
public class Perfil
{
    [Key]
    public Guid Id { get; set; }

    [Column("nombre_completo")]
    public string? NombreCompleto { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    [Column("password")]
    public string Password { get; set; } = null!;

    [Column("url_avatar")]
    public string? UrlAvatar { get; set; }

    [Required]
    [StringLength(50)]
    public string Rol { get; set; } = null!;

    [Column("fecha_creacion")]
    public DateTime FechaCreacion { get; set; }

    [Column("nit")] // <-- AÑADIDO
    public string? Nit { get; set; }
}