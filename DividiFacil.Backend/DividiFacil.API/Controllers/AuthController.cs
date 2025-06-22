using DividiFacil.Domain.DTOs.Auth;
using DividiFacil.Domain.DTOs.Usuario;
using DividiFacil.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DividiFacil.API.Controllers
{
    public class AuthController : ApiControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("registro")]
        [AllowAnonymous]
        public async Task<IActionResult> Registro([FromBody] UsuarioRegistroDto registroDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var resultado = await _authService.RegistrarUsuarioAsync(registroDto);

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] UsuarioLoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var resultado = await _authService.LoginAsync(loginDto);

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpPost("external-login")]
        [AllowAnonymous]
        public async Task<IActionResult> ExternalLogin([FromBody] ExternalAuthDto externalAuth)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var resultado = await _authService.LoginExternoAsync(externalAuth);

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var resultado = await _authService.RefreshTokenAsync(refreshTokenDto.RefreshToken);

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var resultado = await _authService.LogoutAsync(GetUserId());
            return Ok(resultado);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetUsuarioActual()
        {
            var resultado = await _authService.GetUsuarioActualAsync(GetUserId());

            if (!resultado.Exito)
                return BadRequest(resultado);

            return Ok(resultado);
        }
    }
}