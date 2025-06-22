using System;
using DividiFacil.Domain.DTOs.Usuario;

namespace DividiFacil.Domain.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTime Expiracion { get; set; }
        public string RefreshToken { get; set; } = string.Empty;
        public UsuarioDto Usuario { get; set; } = new UsuarioDto();
    }
}