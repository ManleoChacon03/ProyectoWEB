namespace LibreriaChacon.Server.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalProductos { get; set; }
        public int TotalClientes { get; set; }
        public int ProductosBajoStock { get; set; }
        public int TotalPedidos { get; set; }
    }
}
