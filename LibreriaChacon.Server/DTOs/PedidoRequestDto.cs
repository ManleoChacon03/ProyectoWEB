using System.Collections.Generic;


namespace LibreriaChacon.Server.DTOs
{

    public class PedidoRequestDto
    {
        public List<PedidoItemDto> Items { get; set; } = new List<PedidoItemDto>();
        // Aquí podríamos añadir en el futuro datos de envío, pago, etc.
    }
}
