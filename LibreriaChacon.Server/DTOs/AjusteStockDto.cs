namespace LibreriaChacon.Server.DTOs
{
    public class AjusteStockDto
    {
        public int Cantidad { get; set; } // Puede ser positivo (añadir) o negativo (restar)
        public string Motivo { get; set; } 
    }
}
