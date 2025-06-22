using System;

namespace DividiFacil.Domain.DTOs.Balance
{
    public class MovimientoDto
    {
        public MovimientoDto()
        {
            // Inicializamos todas las propiedades string para evitar valores nulos
            TipoMovimiento = string.Empty;
            Concepto = string.Empty;
            Estado = string.Empty;
            NombreUsuarioRelacionado = string.Empty;
        }

        public Guid IdMovimiento { get; set; }
        public string TipoMovimiento { get; set; } // "Gasto", "Pago"
        public string Concepto { get; set; }
        public DateTime FechaCreacion { get; set; }
        public decimal Monto { get; set; }
        public string Estado { get; set; }

        public Guid IdUsuarioRelacionado { get; set; }
        public string NombreUsuarioRelacionado { get; set; }
        public string? ImagenPerfilRelacionado { get; set; }

        public bool EsPropio { get; set; } // Si el usuario actual es el creador
        public Guid? IdGrupo { get; set; }
        public string? NombreGrupo { get; set; }
    }
}