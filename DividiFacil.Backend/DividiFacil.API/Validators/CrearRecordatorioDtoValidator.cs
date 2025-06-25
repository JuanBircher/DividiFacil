using DividiFacil.Domain.DTOs.Notificacion;
using FluentValidation;

namespace DividiFacil.API.Validators
{
    public class CrearRecordatorioDtoValidator : AbstractValidator<CrearRecordatorioDto>
    {
        public CrearRecordatorioDtoValidator()
        {
            RuleFor(x => x.Titulo)
                .NotEmpty().WithMessage("El título es obligatorio")
                .MaximumLength(100).WithMessage("El título no puede superar los 100 caracteres");

            RuleFor(x => x.Mensaje)
                .NotEmpty().WithMessage("El mensaje es obligatorio")
                .MaximumLength(500).WithMessage("El mensaje no puede superar los 500 caracteres");

            RuleFor(x => x.Tipo)
                .NotEmpty().WithMessage("El tipo de recordatorio es obligatorio");

            RuleFor(x => x.FechaRecordatorio)
                .NotEmpty().WithMessage("La fecha de recordatorio es obligatoria");

        }
    }
}