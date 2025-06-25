using DividiFacil.Domain.DTOs.Grupo;
using FluentValidation;

namespace DividiFacil.API.Validators
{
    public class InvitacionDtoValidator : AbstractValidator<InvitacionDto>
    {
        public InvitacionDtoValidator()
        {
            RuleFor(x => x.EmailInvitado)
                .NotEmpty().WithMessage("El email del invitado es obligatorio")
                .EmailAddress().WithMessage("El formato del email no es válido");
        }
    }
}