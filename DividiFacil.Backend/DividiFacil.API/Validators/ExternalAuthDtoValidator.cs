using DividiFacil.Domain.DTOs.Auth;
using FluentValidation;

public class ExternalAuthDtoValidator : AbstractValidator<ExternalAuthDto>
{
    public ExternalAuthDtoValidator()
    {
        RuleFor(x => x.Provider)
            .NotEmpty().WithMessage("El proveedor es obligatorio");

        RuleFor(x => x.IdToken)
            .NotEmpty().WithMessage("El token de autenticación es obligatorio");
    }
}