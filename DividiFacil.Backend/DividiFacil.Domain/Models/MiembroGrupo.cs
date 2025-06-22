using System;

namespace DividiFacil.Domain.Models
{
    public class MiembroGrupo
    {
        public Guid IdMiembro { get; set; }
        public Guid IdUsuario { get; set; }
        public Guid IdGrupo { get; set; }
        public string Rol { get; set; } = "Miembro";
        public DateTime FechaUnion { get; set; }

        // Relaciones de navegación
        public virtual Usuario? Usuario { get; set; }
        public virtual Grupo? Grupo { get; set; }
    }
}