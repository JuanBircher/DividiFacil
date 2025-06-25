using DividiFacil.Domain.DTOs.Grupo;
using FluentValidation;

namespace DividiFacil.API.Validators
{
    public class GrupoCreacionDtoValidator : AbstractValidator<GrupoCreacionDto>
    {
        public GrupoCreacionDtoValidator()
        {
            RuleFor(x => x.NombreGrupo)
                .NotEmpty().WithMessage("El nombre del grupo es obligatorio")
                .MaximumLength(100).WithMessage("El nombre no puede exceder los 100 caracteres");

            RuleFor(x => x.Descripcion)
                .MaximumLength(500).WithMessage("La descripción no puede exceder los 500 caracteres");

            RuleFor(x => x.ModoOperacion)
                .NotEmpty().WithMessage("El modo de operación es obligatorio")
                .Must(m => m == "Estandar" || m == "Pareja" || m == "Roommates")
                .WithMessage("El modo de operación debe ser: Estandar, Pareja o Roommates");
        }
    }
}