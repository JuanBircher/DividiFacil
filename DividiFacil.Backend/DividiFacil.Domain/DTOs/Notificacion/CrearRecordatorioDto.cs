using System;
using System.ComponentModel.DataAnnotations;

namespace DividiFacil.Domain.DTOs.Notificacion
{
    public class CrearRecordatorioDto
    {
        [Required(ErrorMessage = "El título es obligatorio")]
        [StringLength(100, ErrorMessage = "El título no puede superar los 100 caracteres")]
        public string Titulo { get; set; } = string.Empty;

        [Required(ErrorMessage = "El mensaje es obligatorio")]
        [StringLength(500, ErrorMessage = "El mensaje no puede superar los 500 caracteres")]
        public string Mensaje { get; set; } = string.Empty;

        public Guid IdGrupo { get; set; } // No-nullable
        public Guid IdReferencia { get; set; } // No-nullable

        [Required(ErrorMessage = "El tipo de recordatorio es obligatorio")]
        public string Tipo { get; set; } = string.Empty;

        [Required(ErrorMessage = "La fecha de recordatorio es obligatoria")]
        public DateTime FechaRecordatorio { get; set; }

        public bool Repetir { get; set; }
        public string FrecuenciaRepeticion { get; set; } = string.Empty;
    }
}