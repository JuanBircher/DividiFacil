using System;

namespace DividiFacil.Domain.DTOs.CajaComun
{
    public class MovimientoCajaDto
    {
        public Guid IdMovimiento { get; set; }
        public Guid IdCaja { get; set; }
        public Guid IdUsuario { get; set; }
        public string NombreUsuario { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public string TipoMovimiento { get; set; } = string.Empty;
        public string Concepto { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public string? ComprobantePath { get; set; }
    }
}