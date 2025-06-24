using System;

namespace DividiFacil.Domain.DTOs.Balance
{
    public class DeudaSimplificadaDto
    {
        public Guid IdUsuarioDeudor { get; set; }
        public string NombreUsuarioDeudor { get; set; } = string.Empty;
        public string ImagenPerfilDeudor { get; set; } = string.Empty;
        public Guid IdUsuarioAcreedor { get; set; }
        public string NombreUsuarioAcreedor { get; set; } = string.Empty;
        public string ImagenPerfilAcreedor { get; set; } = string.Empty;
        public decimal Monto { get; set; }
    }
}