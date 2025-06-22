using System;

namespace DividiFacil.Domain.Models
{
    public class DetalleGasto
    {
        public Guid IdDetalle { get; set; }
        public Guid IdGasto { get; set; }
        public Guid IdUsuario { get; set; }
        public decimal MontoDebe { get; set; }
        public string Estado { get; set; } = "Pendiente";
        public DateTime? FechaPago { get; set; }

        // Relaciones de navegación
        public virtual Gasto? Gasto { get; set; }
        public virtual Usuario? Usuario { get; set; }
    }
}