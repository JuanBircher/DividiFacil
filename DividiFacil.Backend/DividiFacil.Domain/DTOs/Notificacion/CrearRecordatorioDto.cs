using System;

namespace DividiFacil.Domain.DTOs.Notificacion
{
    public class CrearRecordatorioDto
    {
        public string Titulo { get; set; } = string.Empty;
        public string Mensaje { get; set; } = string.Empty;
        public Guid IdGrupo { get; set; }
        public Guid IdReferencia { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public DateTime FechaRecordatorio { get; set; }
        public bool Repetir { get; set; }
        public string FrecuenciaRepeticion { get; set; } = string.Empty;
    }
}