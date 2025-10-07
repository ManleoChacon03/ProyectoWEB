using System.ComponentModel.DataAnnotations;

namespace LibreriaChacon.Server.DTOs
{

    public class LoginRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
