using System;

namespace DividiFacil.Domain.Models
{
    public class Pago
    {
        public Guid IdPago { get; set; }
        public Guid IdPagador { get; set; }
        public Guid IdReceptor { get; set; }
        public decimal Monto { get; set; }
        public string Concepto { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaConfirmacion { get; set; }
        public string Estado { get; set; } = "Pendiente";  // Pendiente, Confirmado, Rechazado
        public Guid? IdGrupo { get; set; }
        public string? ComprobantePath { get; set; }
        public string? MotivoRechazo { get; set; }

        // Relaciones de navegación
        public virtual Usuario? Pagador { get; set; }
        public virtual Usuario? Receptor { get; set; }
        public virtual Grupo? Grupo { get; set; }
    }
}