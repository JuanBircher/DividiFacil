using DividiFacil.Domain.DTOs.Gasto;
using FluentValidation;
using System.Linq;

namespace DividiFacil.API.Validators
{
    public class GastoCreacionValidator : AbstractValidator<GastoCreacionDto>
    {
        public GastoCreacionValidator()
        {
            RuleFor(x => x.IdGrupo).NotEmpty().WithMessage("El grupo es obligatorio");
            RuleFor(x => x.Monto).GreaterThan(0).WithMessage("El monto debe ser mayor que cero");
            RuleFor(x => x.Descripcion).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Detalles).NotEmpty().WithMessage("Debe especificar al menos un detalle");

            // Modificar esta regla para capturar el contexto correctamente
            RuleFor(x => x.Detalles)
                .Must((gastoDto, detalles) => detalles.Sum(d => d.Monto) == gastoDto.Monto)
                .WithMessage("La suma de los detalles debe ser igual al monto total");
        }
    }
}
