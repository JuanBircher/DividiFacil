namespace DividiFacil.Domain.DTOs.Usuario
{
    public class UsuarioRegistroDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmarPassword { get; set; } = string.Empty;
        public string? Telefono { get; set; }
    }
}