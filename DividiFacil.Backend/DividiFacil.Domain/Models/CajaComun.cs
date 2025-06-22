using System;
using System.Collections.Generic;

namespace DividiFacil.Domain.Models
{
    public class CajaComun
    {
        public Guid IdCaja { get; set; }
        public Guid IdGrupo { get; set; }
        public decimal Saldo { get; set; }
        public DateTime FechaCreacion { get; set; }

        // Relaciones de navegación
        public virtual Grupo? Grupo { get; set; }
        public virtual ICollection<MovimientoCaja>? Movimientos { get; set; }
    }
}