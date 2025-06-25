using DividiFacil.Domain.DTOs.Usuario;
using FluentValidation;

namespace DividiFacil.API.Validators
{
    public class UsuarioRegistroDtoValidator : AbstractValidator<UsuarioRegistroDto>
    {
        public UsuarioRegistroDtoValidator()
        {
            RuleFor(x => x.Nombre)
                .NotEmpty().WithMessage("El nombre es obligatorio")
                .MaximumLength(100).WithMessage("El nombre no puede exceder los 100 caracteres");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("El email es obligatorio")
                .EmailAddress().WithMessage("El formato del email no es válido");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("La contraseña es obligatoria")
                .MinimumLength(6).WithMessage("La contraseña debe tener al menos 6 caracteres")
                .MaximumLength(50).WithMessage("La contraseña no puede exceder los 50 caracteres");

            RuleFor(x => x.ConfirmarPassword)
                .Equal(x => x.Password).WithMessage("Las contraseñas no coinciden");

        }
    }
}