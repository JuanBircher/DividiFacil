using System;
using System.ComponentModel.DataAnnotations;

namespace DividiFacil.Domain.DTOs.CajaComun
{
    public class MovimientoCajaCreacionDto
    {
        [Required(ErrorMessage = "La caja es obligatoria")]
        public Guid IdCaja { get; set; }

        [Required(ErrorMessage = "El monto es obligatorio")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor que cero")]
        public decimal Monto { get; set; }

        [Required(ErrorMessage = "El tipo de movimiento es obligatorio")]
        [RegularExpression("^(Ingreso|Egreso)$",
            ErrorMessage = "El tipo de movimiento debe ser: Ingreso o Egreso")]
        public string TipoMovimiento { get; set; } = string.Empty;

        [Required(ErrorMessage = "El concepto es obligatorio")]
        [StringLength(200, ErrorMessage = "El concepto no puede exceder los 200 caracteres")]
        public string Concepto { get; set; } = string.Empty;
    }
}