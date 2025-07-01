using System;

namespace DividiFacil.Domain.DTOs.CajaComun
{
    public class MovimientoCajaCreacionDto
    {
        public Guid IdCaja { get; set; }
        public decimal Monto { get; set; }
        public string TipoMovimiento { get; set; } = string.Empty; // "Ingreso" o "Egreso"
        public string Concepto { get; set; } = string.Empty;
        public string? ComprobantePath { get; set; }
    }
}