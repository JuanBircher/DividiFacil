using System;

namespace DividiFacil.Domain.DTOs.CajaComun
{
    public class CajaComunDto
    {
        public Guid IdCaja { get; set; }
        public Guid IdGrupo { get; set; }
        public string NombreGrupo { get; set; } = string.Empty;
        public decimal Saldo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public decimal TotalIngresos { get; set; }
        public decimal TotalEgresos { get; set; }
    }
}