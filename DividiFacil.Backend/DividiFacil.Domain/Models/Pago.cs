using System;

namespace DividiFacil.Domain.Models
{
    public class Pago
    {
        public Guid IdPago { get; set; }
        public Guid IdPagador { get; set; }
        public Guid IdReceptor { get; set; }
        public Guid IdGrupo { get; set; }
        public decimal Monto { get; set; }
        public string Concepto { get; set; } = string.Empty;
        public string Estado { get; set; } = "Pendiente"; // Pendiente, Completado, Rechazado
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaPago { get; set; }
        public DateTime? FechaConfirmacion { get; set; } // Agregamos esta propiedad que faltaba
        public string? ComprobantePath { get; set; }
        public string? MotivoRechazo { get; set; }

        // Propiedades de navegación
        public virtual MiembroGrupo? Pagador { get; set; }
        public virtual MiembroGrupo? Receptor { get; set; }
        public virtual Grupo? Grupo { get; set; }
    }
}