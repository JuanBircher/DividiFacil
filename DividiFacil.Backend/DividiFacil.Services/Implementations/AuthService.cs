using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Auth;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Usuario;
using DividiFacil.Domain.Models;
using DividiFacil.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace DividiFacil.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUsuarioRepository usuarioRepository, IConfiguration configuration)
        {
            _usuarioRepository = usuarioRepository;
            _configuration = configuration;
        }

        public async Task<ResponseDto<LoginResponseDto>> RegistrarUsuarioAsync(UsuarioRegistroDto registroDto)
        {
            var response = new ResponseDto<LoginResponseDto>();

            // Verificar si el usuario ya existe
            if (await _usuarioRepository.ExisteUsuarioAsync(registroDto.Email))
            {
                response.Exito = false;
                response.Mensaje = "El usuario ya está registrado";
                return response;
            }

            // Crear nuevo usuario
            var usuario = new Usuario
            {
                IdUsuario = Guid.NewGuid(),
                Nombre = registroDto.Nombre,
                Email = registroDto.Email,
                PasswordHash = HashPassword(registroDto.Password),
                FechaRegistro = DateTime.UtcNow,
                Activo = true,
                Telefono = registroDto.Telefono
            };

            // Guardar usuario en la base de datos
            await _usuarioRepository.CreateAsync(usuario);
            await _usuarioRepository.SaveAsync();

            // Generar token JWT
            var tokenInfo = GenerateJwtToken(usuario);
            var refreshToken = GenerateRefreshToken();

            // Crear respuesta
            response.Data = new LoginResponseDto
            {
                Token = tokenInfo.Token,
                Expiracion = tokenInfo.Expiracion,
                RefreshToken = refreshToken,
                Usuario = new UsuarioDto
                {
                    IdUsuario = usuario.IdUsuario,
                    Nombre = usuario.Nombre,
                    Email = usuario.Email,
                    FechaRegistro = usuario.FechaRegistro,
                    Telefono = usuario.Telefono
                }
            };

            return response;
        }

        public async Task<ResponseDto<LoginResponseDto>> LoginAsync(UsuarioLoginDto loginDto)
        {
            var response = new ResponseDto<LoginResponseDto>();

            // Buscar usuario por email
            var usuario = await _usuarioRepository.GetByEmailAsync(loginDto.Email);

            // Verificar si el usuario existe y la contraseña es correcta
            if (usuario == null || !VerifyPassword(loginDto.Password, usuario.PasswordHash))
            {
                response.Exito = false;
                response.Mensaje = "Email o contraseña incorrectos";
                return response;
            }

            // Verificar si el usuario está activo
            if (!usuario.Activo)
            {
                response.Exito = false;
                response.Mensaje = "Esta cuenta está desactivada";
                return response;
            }

            // Generar token JWT
            var tokenInfo = GenerateJwtToken(usuario);
            var refreshToken = GenerateRefreshToken();

            // Crear respuesta
            response.Data = new LoginResponseDto
            {
                Token = tokenInfo.Token,
                Expiracion = tokenInfo.Expiracion,
                RefreshToken = refreshToken,
                Usuario = new UsuarioDto
                {
                    IdUsuario = usuario.IdUsuario,
                    Nombre = usuario.Nombre,
                    Email = usuario.Email,
                    UrlImagen = usuario.UrlImagen,
                    FechaRegistro = usuario.FechaRegistro,
                    Telefono = usuario.Telefono
                }
            };

            return response;
        }

        public async Task<ResponseDto<LoginResponseDto>> LoginExternoAsync(ExternalAuthDto externalAuth)
        {
            var response = new ResponseDto<LoginResponseDto>();

            // Aquí iría la validación con el proveedor externo
            // Como es un MVP, simulamos que recibimos un email válido
            string email = "usuario_externo@example.com"; // Este dato vendría del token externo
            string nombre = "Usuario Externo"; // Este dato vendría del token externo

            // Buscar si el usuario ya existe
            var usuario = await _usuarioRepository.GetByEmailAsync(email);

            // Si no existe, crearlo
            if (usuario == null)
            {
                usuario = new Usuario
                {
                    IdUsuario = Guid.NewGuid(),
                    Nombre = nombre,
                    Email = email,
                    ProveedorAuth = externalAuth.Provider,
                    IdExterno = "id_externo_ejemplo", // Vendría del token
                    FechaRegistro = DateTime.UtcNow,
                    Activo = true
                };

                await _usuarioRepository.CreateAsync(usuario);
                await _usuarioRepository.SaveAsync();
            }

            // Generar token JWT
            var tokenInfo = GenerateJwtToken(usuario);
            var refreshToken = GenerateRefreshToken();

            // Crear respuesta
            response.Data = new LoginResponseDto
            {
                Token = tokenInfo.Token,
                Expiracion = tokenInfo.Expiracion,
                RefreshToken = refreshToken,
                Usuario = new UsuarioDto
                {
                    IdUsuario = usuario.IdUsuario,
                    Nombre = usuario.Nombre,
                    Email = usuario.Email,
                    UrlImagen = usuario.UrlImagen,
                    FechaRegistro = usuario.FechaRegistro,
                    Telefono = usuario.Telefono
                }
            };

            return response;
        }

        public async Task<ResponseDto<LoginResponseDto>> RefreshTokenAsync(string refreshToken)
        {
            var response = new ResponseDto<LoginResponseDto>();

            // En un sistema real, verificaríamos el refresh token contra uno almacenado
            // Para el MVP, simplemente generamos un nuevo token

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);

            try
            {
                // Validar el token existente para obtener el claim de email
                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = false // No validamos el tiempo de expiración
                };

                var claimsPrincipal = tokenHandler.ValidateToken(refreshToken, tokenValidationParameters, out var validatedToken);
                var emailClaim = claimsPrincipal.FindFirst(ClaimTypes.Email)?.Value;

                if (string.IsNullOrEmpty(emailClaim))
                {
                    throw new SecurityTokenException("Invalid token");
                }

                // Buscar el usuario por email
                var usuario = await _usuarioRepository.GetByEmailAsync(emailClaim);

                if (usuario == null || !usuario.Activo)
                {
                    throw new SecurityTokenException("User not found or inactive");
                }

                // Generar nuevo token JWT
                var tokenInfo = GenerateJwtToken(usuario);
                var newRefreshToken = GenerateRefreshToken();

                // Crear respuesta
                response.Data = new LoginResponseDto
                {
                    Token = tokenInfo.Token,
                    Expiracion = tokenInfo.Expiracion,
                    RefreshToken = newRefreshToken,
                    Usuario = new UsuarioDto
                    {
                        IdUsuario = usuario.IdUsuario,
                        Nombre = usuario.Nombre,
                        Email = usuario.Email,
                        UrlImagen = usuario.UrlImagen,
                        FechaRegistro = usuario.FechaRegistro,
                        Telefono = usuario.Telefono
                    }
                };
            }
            catch (Exception ex)
            {
                response.Exito = false;
                response.Mensaje = $"Error al renovar el token: {ex.Message}";
            }

            return response;
        }

        public async Task<ResponseDto> LogoutAsync(string userId)
        {
            var response = new ResponseDto();

            // En un sistema real, invalidaríamos el refresh token
            // Para el MVP, simplemente retornamos éxito

            return response;
        }

        public async Task<ResponseDto<UsuarioDto>> GetUsuarioActualAsync(string userId)
        {
            var response = new ResponseDto<UsuarioDto>();

            if (!Guid.TryParse(userId, out var idUsuario))
            {
                response.Exito = false;
                response.Mensaje = "ID de usuario inválido";
                return response;
            }

            var usuario = await _usuarioRepository.GetByIdAsync(idUsuario);

            if (usuario == null)
            {
                response.Exito = false;
                response.Mensaje = "Usuario no encontrado";
                return response;
            }

            response.Data = new UsuarioDto
            {
                IdUsuario = usuario.IdUsuario,
                Nombre = usuario.Nombre,
                Email = usuario.Email,
                UrlImagen = usuario.UrlImagen,
                FechaRegistro = usuario.FechaRegistro,
                Telefono = usuario.Telefono
            };

            return response;
        }

        #region Helper Methods

        private string HashPassword(string password)
        {
            // En un sistema de producción, usaríamos BCrypt o PBKDF2
            // Para el MVP, usamos SHA256 con sal
            using (var sha256 = SHA256.Create())
            {
                var salt = Guid.NewGuid().ToString();
                var saltedPassword = password + salt;
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));

                var builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }

                return $"{builder.ToString()}:{salt}";
            }
        }

        private bool VerifyPassword(string password, string? storedHash)
        {
            if (string.IsNullOrEmpty(storedHash) || !storedHash.Contains(':'))
            {
                return false;
            }

            var parts = storedHash.Split(':');
            var salt = parts[1];

            using (var sha256 = SHA256.Create())
            {
                var saltedPassword = password + salt;
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedPassword));

                var builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }

                return parts[0] == builder.ToString();
            }
        }

        private (string Token, DateTime Expiracion) GenerateJwtToken(Usuario usuario)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
            var expiration = DateTime.UtcNow.AddHours(1);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
                    new Claim(ClaimTypes.Email, usuario.Email),
                    new Claim(ClaimTypes.Name, usuario.Nombre),
                }),
                Expires = expiration,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return (tokenHandler.WriteToken(token), expiration);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        #endregion
    }
}