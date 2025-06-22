using System;

namespace DividiFacil.Domain.DTOs.Balance
{
    public class DeudaOrigenDto
    {
        public Guid IdGasto { get; set; }
        public string DescripcionGasto { get; set; }
        public DateTime FechaGasto { get; set; }
        public decimal MontoOriginal { get; set; }
    }
}