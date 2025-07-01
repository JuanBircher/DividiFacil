// Crear solo si no existe ya este archivo
using System;
using System.Collections.Generic;

namespace DividiFacil.Domain.DTOs.Grupo
{
    public class GrupoConMiembrosDto
    {
        public Guid IdGrupo { get; set; }
        public string NombreGrupo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string ModoOperacion { get; set; } = string.Empty;
        public Guid IdUsuarioCreador { get; set; }
        public string NombreCreador { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public string? CodigoAcceso { get; set; }
        public decimal TotalGastos { get; set; }
        public List<MiembroGrupoSimpleDto> Miembros { get; set; } = new List<MiembroGrupoSimpleDto>();
    }

    public class MiembroGrupoSimpleDto
    {
        public Guid IdMiembro { get; set; }
        public Guid IdUsuario { get; set; }
        public string NombreUsuario { get; set; } = string.Empty;
        public string EmailUsuario { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
        public DateTime FechaUnion { get; set; }
    }
}