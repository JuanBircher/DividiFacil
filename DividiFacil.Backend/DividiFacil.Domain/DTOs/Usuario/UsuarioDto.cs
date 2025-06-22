using System;

namespace DividiFacil.Domain.DTOs.Usuario
{
    public class UsuarioDto
    {
        public Guid IdUsuario { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? UrlImagen { get; set; }
        public string? Telefono { get; set; }
        public DateTime FechaRegistro { get; set; }
    }
}