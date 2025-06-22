using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace DividiFacil.Domain.Models
{
    public class Usuario
    {
        public Guid IdUsuario { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PasswordHash { get; set; }
        public string? ProveedorAuth { get; set; }
        public string? IdExterno { get; set; }
        public DateTime FechaRegistro { get; set; }
        public bool Activo { get; set; }
        public string? UrlImagen { get; set; }
        public string? TokenNotificacion { get; set; }
        public string? Telefono { get; set; }

        // Relaciones de navegación
        public virtual ICollection<MiembroGrupo>? MiembrosGrupo { get; set; }
        public virtual ICollection<Gasto>? GastosPagados { get; set; }
        public virtual ICollection<DetalleGasto>? DetallesGasto { get; set; }
        public virtual ICollection<Grupo>? GruposCreados { get; set; }
    }
}