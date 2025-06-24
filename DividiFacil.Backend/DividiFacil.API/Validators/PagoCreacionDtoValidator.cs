using DividiFacil.Domain.DTOs.Pago;
using FluentValidation;

public class PagoCreacionDtoValidator : AbstractValidator<PagoCreacionDto>
{
    public PagoCreacionDtoValidator()
    {
        RuleFor(x => x.IdReceptor).NotEmpty().WithMessage("El ID del receptor es obligatorio");
        RuleFor(x => x.Monto).GreaterThan(0).WithMessage("El monto debe ser mayor que 0");
        RuleFor(x => x.Concepto)
            .NotEmpty().WithMessage("El concepto es obligatorio")
            .MaximumLength(200).WithMessage("El concepto no puede exceder los 200 caracteres");
    }
}