using System.Collections.Generic;


namespace LibreriaChacon.Server.DTOs
{

    public class VentaRequestDto
    {
        public string? ClienteNit { get; set; }
        public string? ClienteNombre { get; set; }
        public List<VentaItemDto> Items { get; set; } = new List<VentaItemDto>();
    }
}
