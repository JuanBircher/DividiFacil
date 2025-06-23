using System;

namespace DividiFacil.Domain.Models
{
    public class ConfiguracionNotificaciones
    {
        public Guid IdConfiguracion { get; set; }
        public Guid IdUsuario { get; set; }
        public bool NotificarNuevosPagos { get; set; } = true;
        public bool NotificarNuevosGastos { get; set; } = true;
        public bool NotificarInvitacionesGrupo { get; set; } = true;
        public bool NotificarCambiosEstadoPagos { get; set; } = true;
        public bool RecordatoriosDeudas { get; set; } = true;
        public bool RecordatoriosPagos { get; set; } = true;
        public string FrecuenciaRecordatorios { get; set; } = "Semanal"; // "Diario", "Semanal", "Mensual"

        // Relaciones de navegación
        public virtual Usuario? Usuario { get; set; }
    }
}