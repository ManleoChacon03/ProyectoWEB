using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace LibreriaChacon.Server.DTOs
{
  
    public class DevolucionRequestDto
    {
        [Required]
        public long PedidoId { get; set; }
        [Required]
        public string Motivo { get; set; }
        [Required]
        public List<DevolucionItemDto> Items { get; set; } = new List<DevolucionItemDto>();
    }
}
