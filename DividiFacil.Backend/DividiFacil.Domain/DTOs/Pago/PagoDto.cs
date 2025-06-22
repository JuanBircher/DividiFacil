using System;

namespace DividiFacil.Domain.DTOs.Pago
{
    public class PagoDto
    {
        // Constructor para inicializar propiedades no nulas
        public PagoDto()
        {
            NombrePagador = string.Empty;
            NombreReceptor = string.Empty;
            Concepto = string.Empty;
            Estado = string.Empty;
        }

        public Guid IdPago { get; set; }
        public Guid IdPagador { get; set; }
        public string NombrePagador { get; set; }
        public Guid IdReceptor { get; set; }
        public string NombreReceptor { get; set; }
        public decimal Monto { get; set; }
        public string Concepto { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaConfirmacion { get; set; }
        public string Estado { get; set; }
        public Guid IdGrupo { get; set; }
        public string? NombreGrupo { get; set; }
        public string? ComprobantePath { get; set; }
        public string? MotivoRechazo { get; set; }
    }
}