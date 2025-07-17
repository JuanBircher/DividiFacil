using DividiFacil.Domain.DTOs.Auth;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Usuario;
using System.Threading.Tasks;

namespace DividiFacil.Services.Interfaces
{
    public interface IAuthService
    {
        Task<ResponseDto<LoginResponseDto>> RegistrarUsuarioAsync(UsuarioRegistroDto registroDto);
        Task<ResponseDto<LoginResponseDto>> LoginAsync(UsuarioLoginDto loginDto);
        Task<ResponseDto<LoginResponseDto>> LoginExternoAsync(ExternalAuthDto externalAuth);
        Task<ResponseDto<LoginResponseDto>> RefreshTokenAsync(string refreshToken);
        Task<ResponseDto> LogoutAsync(string userId);
        Task<ResponseDto<UsuarioDto>> GetUsuarioActualAsync(string userId);
        Task<ResponseDto> RegistrarTokenFcmAsync(string idUsuario, string tokenFcm);
    }
}