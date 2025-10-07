namespace LibreriaChacon.Server.DTOs
{
    // En DTOs/DashboardStatsDto.cs
    public class DashboardStatsDto
    {
        public int TotalProductos { get; set; }
        public int TotalClientes { get; set; }
        public int ProductosBajoStock { get; set; }
        public int TotalPedidos { get; set; }
    }
}
