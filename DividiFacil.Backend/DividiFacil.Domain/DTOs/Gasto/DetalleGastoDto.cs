using System;

namespace DividiFacil.Domain.DTOs.Gasto
{
    public class DetalleGastoDto
    {
        public Guid IdDetalleGasto { get; set; }
        public Guid IdMiembroDeudor { get; set; }
        public string NombreMiembroDeudor { get; set; }
        public decimal Monto { get; set; }
        public bool Pagado { get; set; }
    }
}