using System;

namespace DividiFacil.Domain.DTOs.Gasto
{
    public class DetalleGastoDto
    {
        public Guid IdDetalle { get; set; }
        public Guid IdGasto { get; set; }
        public Guid IdUsuario { get; set; }
        public string NombreUsuario { get; set; } = string.Empty;
        public string? UrlImagen { get; set; }
        public decimal MontoDebe { get; set; }
        public string Estado { get; set; } = "Pendiente";
        public DateTime? FechaPago { get; set; }
    }
}