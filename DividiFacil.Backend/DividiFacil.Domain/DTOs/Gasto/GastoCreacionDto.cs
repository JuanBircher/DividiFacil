using System;
using System.Collections.Generic;

namespace DividiFacil.Domain.DTOs.Gasto
{
    public class GastoCreacionDto
    {
        public Guid IdGrupo { get; set; }
        public decimal Monto { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public string Categoria { get; set; } = string.Empty;
        public DateTime? FechaGasto { get; set; }
        public string? ComprobantePath { get; set; }
        public List<DetalleGastoCreacionDto> Detalles { get; set; } = new();
    }
}