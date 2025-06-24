using DividiFacil.Domain.DTOs.Base;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;

public class ModelValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!context.ModelState.IsValid)
        {
            var errorsInModelState = context.ModelState
                .Where(x => x.Value.Errors.Count > 0)
                .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Errors.Select(x => x.ErrorMessage))
                .ToArray();

            var errorResponse = new ResponseDto
            {
                Exito = false,
                Mensaje = "Errores de validación"
            };

            context.Result = new BadRequestObjectResult(errorResponse);
            return;
        }

        await next();
    }
}