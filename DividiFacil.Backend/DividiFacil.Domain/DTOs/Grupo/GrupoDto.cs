using System;

namespace DividiFacil.Domain.DTOs.Grupo
{
    public class GrupoDto
    {
        public Guid IdGrupo { get; set; }
        public string NombreGrupo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string ModoOperacion { get; set; } = "Estandar";
        public Guid IdUsuarioCreador { get; set; }
        public string NombreCreador { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public string? CodigoAcceso { get; set; }
        public int CantidadMiembros { get; set; }
        public decimal TotalGastos { get; set; }
    }
}