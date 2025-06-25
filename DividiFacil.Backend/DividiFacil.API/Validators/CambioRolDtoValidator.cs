using DividiFacil.API.Controllers;
using FluentValidation;

namespace DividiFacil.API.Validators
{
    // Asumiendo que tienes un DTO llamado CambioRolDto con una propiedad string NuevoRol
    public class CambioRolDtoValidator : AbstractValidator<CambioRolDto>
    {
        public CambioRolDtoValidator()
        {
            RuleFor(x => x.NuevoRol)
                .NotEmpty().WithMessage("El nuevo rol es obligatorio")
                .Must(r => r == "Miembro" || r == "Admin")
                .WithMessage("El rol debe ser: Miembro o Admin");
        }
    }
}