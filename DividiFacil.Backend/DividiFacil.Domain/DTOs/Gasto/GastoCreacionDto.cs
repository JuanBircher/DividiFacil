using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DividiFacil.Domain.DTOs.Gasto
{
    public class GastoCreacionDto
    {
        [Required(ErrorMessage = "El ID del grupo es obligatorio")]
        public Guid IdGrupo { get; set; }

        [Required(ErrorMessage = "El monto del gasto es obligatorio")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El monto debe ser mayor que 0")]
        public decimal Monto { get; set; }

        [Required(ErrorMessage = "La descripción del gasto es obligatoria")]
        [StringLength(200, ErrorMessage = "La descripción no puede exceder los 200 caracteres")]
        public string Descripcion { get; set; } = string.Empty;

        [StringLength(50, ErrorMessage = "La categoría no puede exceder los 50 caracteres")]
        public string Categoria { get; set; } = string.Empty;
        public DateTime? FechaGasto { get; set; }

        public string? ComprobantePath { get; set; }

        [Required(ErrorMessage = "Debe especificar al menos un detalle de gasto")]
        public List<DetalleGastoCreacionDto> Detalles { get; set; } = new();
    }
}