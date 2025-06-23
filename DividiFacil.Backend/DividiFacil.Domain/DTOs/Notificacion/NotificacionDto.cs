using System;

namespace DividiFacil.Domain.DTOs.Notificacion
{
    public class NotificacionDto
    {
        public Guid IdNotificacion { get; set; }
        public Guid IdUsuario { get; set; }
        public Guid IdGrupo { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public string Mensaje { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaEnvio { get; set; }
        public string CanalEnvio { get; set; } = string.Empty;
        public string? NombreUsuario { get; set; }
        public string? NombreGrupo { get; set; }
    }
}