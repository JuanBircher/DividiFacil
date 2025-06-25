namespace DividiFacil.Domain.DTOs.Grupo
{
    public class GrupoCreacionDto
    {
        public string NombreGrupo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string ModoOperacion { get; set; } = "Estandar";
    }
}