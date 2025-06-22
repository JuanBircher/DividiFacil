using System;
using System.Collections.Generic;

namespace DividiFacil.Domain.Models
{
    public class Gasto
    {
        public Guid IdGasto { get; set; }
        public Guid IdGrupo { get; set; }
        public Guid IdPagador { get; set; }
        public decimal Monto { get; set; }
        public string Concepto { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public string TipoGasto { get; set; } = "Normal";
        public DateTime? FechaVencimiento { get; set; }
        public string? ComprobantePath { get; set; }

        // Relaciones de navegación
        public virtual Grupo? Grupo { get; set; }
        public virtual Usuario? Pagador { get; set; }
        public virtual ICollection<DetalleGasto>? Detalles { get; set; }
    }
}