using System;

namespace DividiFacil.Domain.Models
{
    public class MovimientoCaja
    {
        public Guid IdMovimiento { get; set; }
        public Guid IdCaja { get; set; }
        public Guid IdUsuario { get; set; }
        public decimal Monto { get; set; }
        public string TipoMovimiento { get; set; } = string.Empty;
        public string Concepto { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public string? ComprobantePath { get; set; }

        // Relaciones de navegación
        public virtual CajaComun? Caja { get; set; }
        public virtual Usuario? Usuario { get; set; }
    }
}