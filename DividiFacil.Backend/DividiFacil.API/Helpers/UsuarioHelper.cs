using System.Security.Claims;

namespace DividiFacil.API.Helpers
{
    public static class UsuarioHelper
    {
        public static string ObtenerIdUsuario(ClaimsPrincipal user)
        {
            // Buscar el ID en diferentes claims posibles
            var idUsuario = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                           user.FindFirst("sub")?.Value ??
                           user.FindFirst("id")?.Value ??
                           user.Identity?.Name;

            return idUsuario ?? string.Empty;
        }

        public static bool ValidarIdUsuario(string idUsuario, out Guid idUsuarioGuid)
        {
            return Guid.TryParse(idUsuario, out idUsuarioGuid) && idUsuarioGuid != Guid.Empty;
        }
    }
}