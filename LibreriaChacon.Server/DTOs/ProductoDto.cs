namespace LibreriaChacon.Server.DTOs
{
    // En DTOs/ProductoDto.cs
    public class ProductoDto
    {
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public decimal Precio { get; set; }
        public int CantidadStock { get; set; }
        public string? ImagenUrl { get; set; }
        public List<int> CategoriaIds { get; set; } = new List<int>();
    }
}
