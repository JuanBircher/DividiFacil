using System.ComponentModel.DataAnnotations;

namespace DividiFacil.Domain.DTOs.Grupo
{
    public class GrupoCreacionDto
    {
        [Required(ErrorMessage = "El nombre del grupo es obligatorio")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder los 100 caracteres")]
        public string NombreGrupo { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres")]
        public string? Descripcion { get; set; }

        [RegularExpression("^(Estandar|Pareja|Roommates)$",
            ErrorMessage = "El modo de operación debe ser: Estandar, Pareja o Roommates")]
        public string ModoOperacion { get; set; } = "Estandar";
    }
}