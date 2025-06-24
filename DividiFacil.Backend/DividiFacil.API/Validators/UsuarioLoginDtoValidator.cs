using DividiFacil.Domain.DTOs.Usuario;
using FluentValidation;

public class UsuarioLoginDtoValidator : AbstractValidator<UsuarioLoginDto>
{
    public UsuarioLoginDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El email es obligatorio")
            .EmailAddress().WithMessage("El formato del email no es válido");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es obligatoria");
    }
}