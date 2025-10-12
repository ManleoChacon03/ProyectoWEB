namespace LibreriaChacon.Server.DTOs
{
    public class ReporteVentaDto
    {
        public long PedidoId { get; set; }
        public DateTime FechaVenta { get; set; }
        public string TipoVenta { get; set; } = string.Empty;
        public string VendidoPor { get; set; } = string.Empty; // Nombre del operador o cliente
        public string ClienteNombre { get; set; } = string.Empty;
        public string ClienteNit { get; set; } = string.Empty;
        public int TotalItems { get; set; }
        public decimal MontoTotal { get; set; }
    }
}
