using System;
using System.Collections.Generic;

namespace DividiFacil.Domain.Models
{
    public class Grupo
    {
        public Guid IdGrupo { get; set; }
        public string NombreGrupo { get; set; } = string.Empty;
        public Guid IdUsuarioCreador { get; set; }
        public DateTime FechaCreacion { get; set; }
        public string? Descripcion { get; set; }
        public string ModoOperacion { get; set; } = "Estandar";
        public string? CodigoAcceso { get; set; }

        // Relaciones de navegación
        public virtual Usuario? UsuarioCreador { get; set; }
        public virtual ICollection<MiembroGrupo>? Miembros { get; set; }
        public virtual ICollection<Gasto>? Gastos { get; set; }
        public virtual CajaComun? CajaComun { get; set; }
    }
}