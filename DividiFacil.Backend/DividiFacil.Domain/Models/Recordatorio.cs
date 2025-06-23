using System;

namespace DividiFacil.Domain.Models
{
    public class Recordatorio
    {
        public Guid IdRecordatorio { get; set; }
        public Guid IdUsuario { get; set; }
        public Guid IdGrupo { get; set; } 
        public Guid IdReferencia { get; set; } 
        public string Titulo { get; set; } = string.Empty;
        public string Mensaje { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty; 
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaRecordatorio { get; set; }
        public bool Completado { get; set; }
        public bool Repetir { get; set; }
        public string FrecuenciaRepeticion { get; set; } = string.Empty; // "Diario", "Semanal", "Mensual"
        public string Estado { get; set; } = "Pendiente"; // "Pendiente", "Enviado", "Cancelado"

        // Relaciones de navegación
        public virtual Usuario? Usuario { get; set; }
        public virtual Grupo? Grupo { get; set; }
    }
}