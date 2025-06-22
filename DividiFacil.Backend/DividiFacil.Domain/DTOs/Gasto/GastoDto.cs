using System;
using System.Collections.Generic;

namespace DividiFacil.Domain.DTOs.Gasto
{
    public class GastoDto
    {
        public Guid IdGasto { get; set; }
        public Guid IdGrupo { get; set; }
        public string NombreGrupo { get; set; } = string.Empty;
        public Guid IdPagador { get; set; }
        public string NombrePagador { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public string Concepto { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public string TipoGasto { get; set; } = "Normal";
        public DateTime? FechaVencimiento { get; set; }
        public string? ComprobantePath { get; set; }
        public List<DetalleGastoDto> Detalles { get; set; } = new List<DetalleGastoDto>();
    }
}