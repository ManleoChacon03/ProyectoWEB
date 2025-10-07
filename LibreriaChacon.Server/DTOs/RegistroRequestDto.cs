using System.ComponentModel.DataAnnotations;


namespace LibreriaChacon.Server.DTOs
{

    public class RegistroRequestDto
    {
        [Required]
        public string NombreCompleto { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
