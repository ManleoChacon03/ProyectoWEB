// En Models/Pedido.cs
using LibreriaChacon.Server.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("pedidos")]
public class Pedido
{
    [Key]
    public long Id { get; set; }

    [Column("usuario_id")]
    public Guid UsuarioId { get; set; }

    [Column("monto_total", TypeName = "decimal(18, 2)")]
    public decimal MontoTotal { get; set; }

    [Required]
    public string Estado { get; set; } = null!;

    [Column("fecha_creacion")]
    public DateTime FechaCreacion { get; set; }

    [Required]
    [Column("tipo_venta")]
    public string TipoVenta { get; set; } = null!;

    [Column("cliente_nit")] // <-- AÑADIDO
    public string? ClienteNit { get; set; }

    [Column("cliente_nombre")] // <-- AÑADIDO
    public string? ClienteNombre { get; set; }

    // Propiedades de navegación
    public Perfil Usuario { get; set; } = null!;
    public ICollection<DetallePedido> DetallePedido { get; set; } = new List<DetallePedido>();
}