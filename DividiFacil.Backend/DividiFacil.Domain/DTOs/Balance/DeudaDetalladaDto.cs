namespace DividiFacil.Domain.DTOs.Balance
{
    public class DeudaDetalladaDto
    {
        public Guid IdUsuarioDeudor { get; set; }
        public string NombreUsuarioDeudor { get; set; } = string.Empty;
        public Guid IdUsuarioAcreedor { get; set; }
        public string NombreUsuarioAcreedor { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public List<DeudaOrigenDto> Origenes { get; set; } = new List<DeudaOrigenDto>();
    }
}