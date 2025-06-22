using System;

namespace DividiFacil.Domain.Models
{
    public class DetalleGasto
    {
        public Guid IdDetalleGasto { get; set; }
        public Guid IdGasto { get; set; }
        public Guid IdMiembroDeudor { get; set; }
        public decimal Monto { get; set; }
        public bool Pagado { get; set; }

        // Propiedades de navegación
        public virtual Gasto? Gasto { get; set; }
        public virtual MiembroGrupo? MiembroDeudor { get; set; }
    }
}