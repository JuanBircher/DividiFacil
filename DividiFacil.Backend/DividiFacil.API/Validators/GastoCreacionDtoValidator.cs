using DividiFacil.Domain.DTOs.Gasto;
using FluentValidation;
using System.Linq;

public class GastoCreacionDtoValidator : AbstractValidator<GastoCreacionDto>
{
    public GastoCreacionDtoValidator()
    {
        RuleFor(x => x.IdGrupo).NotEmpty().WithMessage("El ID del grupo es obligatorio");
        RuleFor(x => x.Monto).GreaterThan(0).WithMessage("El monto debe ser mayor que 0");
        RuleFor(x => x.Descripcion)
            .NotEmpty().WithMessage("La descripción es obligatoria")
            .MaximumLength(200).WithMessage("La descripción no puede exceder los 200 caracteres");
        RuleFor(x => x.Categoria)
            .MaximumLength(50).WithMessage("La categoría no puede exceder los 50 caracteres");
        RuleFor(x => x.Detalles)
            .NotEmpty().WithMessage("Debe especificar al menos un detalle de gasto");
        RuleForEach(x => x.Detalles).SetValidator(new DetalleGastoCreacionDtoValidator());

        RuleFor(x => x)
            .Custom((gastoDto, context) =>
            {
                if (gastoDto.Detalles == null || !gastoDto.Detalles.Any())
                    return;

                decimal totalDetalles = gastoDto.Detalles.Sum(d => d.Monto);
                if (Math.Abs(totalDetalles - gastoDto.Monto) > 0.01m)
                {
                    context.AddFailure(
                        "Detalles",
                        $"La suma de los detalles ({totalDetalles}) debe ser igual al monto total ({gastoDto.Monto})");
                }
            });
    }
}

public class DetalleGastoCreacionDtoValidator : AbstractValidator<DetalleGastoCreacionDto>
{
    public DetalleGastoCreacionDtoValidator()
    {
        RuleFor(x => x.IdMiembroDeudor).NotEmpty().WithMessage("El ID del miembro deudor es obligatorio");
        RuleFor(x => x.Monto).GreaterThan(0).WithMessage("El monto debe ser mayor que 0");
    }
}