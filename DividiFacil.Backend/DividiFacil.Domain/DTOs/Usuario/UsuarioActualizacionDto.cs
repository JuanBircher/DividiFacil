namespace DividiFacil.Domain.DTOs.Usuario
{
    public class UsuarioActualizacionDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public string? UrlImagen { get; set; }
    }
}