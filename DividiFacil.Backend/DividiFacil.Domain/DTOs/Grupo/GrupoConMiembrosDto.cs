using System.Collections.Generic;

namespace DividiFacil.Domain.DTOs.Grupo
{
    public class GrupoConMiembrosDto : GrupoDto
    {
        public IEnumerable<MiembroDto> Miembros { get; set; } = new List<MiembroDto>();
    }
}