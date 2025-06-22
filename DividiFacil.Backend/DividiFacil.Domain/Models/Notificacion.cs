using System;

namespace DividiFacil.Domain.Models
{
    public class Notificacion
    {
        public Guid IdNotificacion { get; set; }
        public Guid IdUsuario { get; set; }
        public Guid IdGrupo { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public string Mensaje { get; set; } = string.Empty;
        public string Estado { get; set; } = "Pendiente";
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaEnvio { get; set; }
        public string CanalEnvio { get; set; } = "Email";

        // Relaciones de navegación
        public virtual Usuario? Usuario { get; set; }
        public virtual Grupo? Grupo { get; set; }
    }
}