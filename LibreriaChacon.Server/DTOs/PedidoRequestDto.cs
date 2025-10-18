using System.Collections.Generic;


namespace LibreriaChacon.Server.DTOs
{

    public class PedidoRequestDto
    {
        public List<PedidoItemDto> Items { get; set; } = new List<PedidoItemDto>();
    }
}
