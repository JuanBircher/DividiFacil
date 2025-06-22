using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DividiFacil.Domain.DTOs.Gasto
{
    public class GastoCreacionDto
    {
        [Required(ErrorMessage = "El grupo es obligatorio")]
        public Guid IdGrupo { get; set; }

        [Required(ErrorMessage = "El monto es obligatorio")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor que cero")]
        public decimal Monto { get; set; }

        [Required(ErrorMessage = "El concepto es obligatorio")]
        [StringLength(200, ErrorMessage = "El concepto no puede exceder los 200 caracteres")]
        public string Concepto { get; set; } = string.Empty;

        public DateTime? Fecha { get; set; }

        [RegularExpression("^(Normal|Recurrente|Rotativo)$",
            ErrorMessage = "El tipo de gasto debe ser: Normal, Recurrente o Rotativo")]
        public string TipoGasto { get; set; } = "Normal";

        public DateTime? FechaVencimiento { get; set; }

        // Lista de usuarios que participan y cuánto debe pagar cada uno
        public List<DetalleGastoCreacionDto> Detalles { get; set; } = new List<DetalleGastoCreacionDto>();
    }
}