using System;

namespace DividiFacil.Domain.DTOs.Grupo
{
    public class MiembroDto
    {
        public Guid IdMiembro { get; set; }
        public Guid IdUsuario { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? UrlImagen { get; set; }
        public string Rol { get; set; } = "Miembro";
        public DateTime FechaUnion { get; set; }
    }
}