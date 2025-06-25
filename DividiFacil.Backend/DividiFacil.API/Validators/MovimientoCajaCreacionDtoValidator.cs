using DividiFacil.Domain.DTOs.CajaComun;
using FluentValidation;

namespace DividiFacil.API.Validators
{
    public class MovimientoCajaCreacionDtoValidator : AbstractValidator<MovimientoCajaCreacionDto>
    {
        public MovimientoCajaCreacionDtoValidator()
        {
            RuleFor(x => x.IdCaja)
                .NotEmpty().WithMessage("La caja es obligatoria");

            RuleFor(x => x.Monto)
                .GreaterThan(0).WithMessage("El monto debe ser mayor que cero");

            RuleFor(x => x.TipoMovimiento)
                .NotEmpty().WithMessage("El tipo de movimiento es obligatorio")
                .Must(t => t == "Ingreso" || t == "Egreso")
                .WithMessage("El tipo de movimiento debe ser: Ingreso o Egreso");

            RuleFor(x => x.Concepto)
                .NotEmpty().WithMessage("El concepto es obligatorio")
                .MaximumLength(200).WithMessage("El concepto no puede exceder los 200 caracteres");
        }
    }
}