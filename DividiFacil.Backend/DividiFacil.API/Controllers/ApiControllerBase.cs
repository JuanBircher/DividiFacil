using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DividiFacil.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class ApiControllerBase : ControllerBase
    {
        protected string GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        }

        protected string GetUserEmail()
        {
            return User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        }

        protected string GetUserName()
        {
            return User.FindFirstValue(ClaimTypes.Name) ?? string.Empty;
        }
    }
}