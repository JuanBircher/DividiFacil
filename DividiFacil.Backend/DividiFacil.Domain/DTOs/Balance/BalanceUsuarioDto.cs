namespace DividiFacil.Domain.DTOs.Balance
{
    public class BalanceUsuarioDto
    {
        public Guid IdMiembro { get; set; }
        public string IdUsuario { get; set; } = string.Empty;
        public string NombreUsuario { get; set; } = string.Empty;
        public string ImagenPerfil { get; set; } = string.Empty;
        public decimal TotalPagado { get; set; }
        public decimal DeberiaHaberPagado { get; set; }
        public decimal Balance { get; set; }
        public List<DeudaDetalladaDto> DeudasDetalladas { get; set; } = new List<DeudaDetalladaDto>();
    }
}