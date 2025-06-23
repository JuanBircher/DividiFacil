using System;

namespace DividiFacil.Domain.DTOs.Notificacion
{
    public class RecordatorioDto
    {
        public Guid IdRecordatorio { get; set; }
        public Guid IdUsuario { get; set; }
        public Guid IdGrupo { get; set; }
        public Guid IdReferencia { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Mensaje { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public DateTime FechaRecordatorio { get; set; }
        public bool Completado { get; set; }
        public bool Repetir { get; set; }
        public string FrecuenciaRepeticion { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string NombreUsuario { get; set; } = string.Empty;
        public string NombreGrupo { get; set; } = string.Empty;
    }
}