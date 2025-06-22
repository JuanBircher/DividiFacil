using System;
using System.Collections.Generic;

namespace DividiFacil.Domain.Models
{
    public class Gasto
    {
        public Guid IdGasto { get; set; }
        public Guid IdGrupo { get; set; }
        public Guid IdMiembroPagador { get; set; }
        public decimal Monto { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public string? Categoria { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaGasto { get; set; }
        public string? ComprobantePath { get; set; }

        // Propiedades de navegación
        public virtual Grupo? Grupo { get; set; }
        public virtual MiembroGrupo? MiembroPagador { get; set; }
        public virtual ICollection<DetalleGasto>? DetallesGasto { get; set; }
    }
}