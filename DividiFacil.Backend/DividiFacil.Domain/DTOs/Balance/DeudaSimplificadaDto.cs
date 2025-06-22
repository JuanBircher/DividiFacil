using System;

namespace DividiFacil.Domain.DTOs.Balance
{
    public class DeudaSimplificadaDto
    {
        public Guid IdUsuarioDeudor { get; set; }
        public string NombreUsuarioDeudor { get; set; }
        public string ImagenPerfilDeudor { get; set; }
        public Guid IdUsuarioAcreedor { get; set; }
        public string NombreUsuarioAcreedor { get; set; }
        public string ImagenPerfilAcreedor { get; set; }
        public decimal Monto { get; set; }
    }
}