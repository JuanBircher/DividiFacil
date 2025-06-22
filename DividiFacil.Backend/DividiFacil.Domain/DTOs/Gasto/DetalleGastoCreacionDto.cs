using System;
using System.ComponentModel.DataAnnotations;

namespace DividiFacil.Domain.DTOs.Gasto
{
    public class DetalleGastoCreacionDto
    {
        [Required(ErrorMessage = "El ID del miembro deudor es obligatorio")]
        public Guid IdMiembroDeudor { get; set; }

        [Required(ErrorMessage = "El monto del detalle es obligatorio")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor que 0")]
        public decimal Monto { get; set; }
    }
}