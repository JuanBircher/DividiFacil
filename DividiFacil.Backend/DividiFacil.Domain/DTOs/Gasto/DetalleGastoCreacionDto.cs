using System;
using System.ComponentModel.DataAnnotations;

namespace DividiFacil.Domain.DTOs.Gasto
{
    public class DetalleGastoCreacionDto
    {
        [Required(ErrorMessage = "El usuario es obligatorio")]
        public Guid IdUsuario { get; set; }

        [Required(ErrorMessage = "El monto que debe es obligatorio")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor que cero")]
        public decimal MontoDebe { get; set; }
    }
}