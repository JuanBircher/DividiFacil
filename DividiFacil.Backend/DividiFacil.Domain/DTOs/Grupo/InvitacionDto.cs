using System.ComponentModel.DataAnnotations;

namespace DividiFacil.Domain.DTOs.Grupo
{
    public class InvitacionDto
    {
        [Required(ErrorMessage = "El email del invitado es obligatorio")]
        [EmailAddress(ErrorMessage = "El formato del email no es válido")]
        public string EmailInvitado { get; set; } = string.Empty;
    }
}