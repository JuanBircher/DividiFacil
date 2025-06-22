using System;
using System.ComponentModel.DataAnnotations;

namespace DividiFacil.Domain.DTOs.Pago
{
    public class PagoCreacionDto
    {
        [Required(ErrorMessage = "El ID del receptor es obligatorio")]
        public Guid IdReceptor { get; set; }

        [Required(ErrorMessage = "El monto del pago es obligatorio")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor que 0")]
        public decimal Monto { get; set; }

        [Required(ErrorMessage = "El concepto del pago es obligatorio")]
        [StringLength(200, ErrorMessage = "El concepto no puede exceder los 200 caracteres")]
        public string Concepto { get; set; }

        public Guid? IdGrupo { get; set; }

        public string? ComprobantePath { get; set; }
    }
}