using System;

namespace DividiFacil.Domain.DTOs.Pago
{
    public class PagoCreacionDto
    {
        public PagoCreacionDto()
        {
            Concepto = string.Empty;
        }

        public Guid IdReceptor { get; set; }
        public Guid? IdGrupo { get; set; }
        public decimal Monto { get; set; }
        public string Concepto { get; set; }
        public string? ComprobantePath { get; set; }
    }
}