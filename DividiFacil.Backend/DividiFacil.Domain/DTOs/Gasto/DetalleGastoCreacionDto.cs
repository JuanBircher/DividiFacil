using System;

namespace DividiFacil.Domain.DTOs.Gasto
{
    public class DetalleGastoCreacionDto
    {
        public Guid IdMiembroDeudor { get; set; }
        public decimal Monto { get; set; }
    }
}