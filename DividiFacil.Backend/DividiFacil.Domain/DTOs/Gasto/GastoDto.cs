namespace DividiFacil.Domain.DTOs.Gasto
{
    public class GastoDto
    {
        public Guid IdGasto { get; set; }
        public Guid IdGrupo { get; set; }
        public string NombreGrupo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public Guid IdUsuarioPago { get; set; }
        public string NombreMiembroPagador { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public string? Categoria { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaGasto { get; set; }
        public string? ComprobantePath { get; set; }
        public List<DetalleGastoDto>? Detalles { get; set; }
    }
}