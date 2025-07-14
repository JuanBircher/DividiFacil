using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Usuario;
using DividiFacil.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DividiFacil.Services.Implementations
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _usuarioRepository;

        public UsuarioService(IUsuarioRepository usuarioRepository)
        {
            _usuarioRepository = usuarioRepository;
        }

        public async Task<ResponseDto<UsuarioDto>> GetByIdAsync(Guid id)
        {
            var usuario = await _usuarioRepository.GetByIdAsync(id);

            if (usuario == null)
            {
                return new ResponseDto<UsuarioDto>
                {
                    Exito = false,
                    Mensaje = "Usuario no encontrado"
                };
            }

            return new ResponseDto<UsuarioDto>
            {
                Exito = true,
                Data = new UsuarioDto
                {
                    IdUsuario = usuario.IdUsuario,
                    Nombre = usuario.Nombre,
                    Email = usuario.Email,
                    UrlImagen = usuario.UrlImagen,
                    FechaRegistro = usuario.FechaRegistro,
                    Telefono = usuario.Telefono,
                    Plan = usuario.Plan
                }
            };
        }

        public async Task<ResponseDto<IEnumerable<UsuarioDto>>> GetByGrupoAsync(Guid idGrupo)
        {
            var usuarios = await _usuarioRepository.GetByGrupoAsync(idGrupo);
            var usuariosDto = new List<UsuarioDto>();

            foreach (var usuario in usuarios)
            {
                usuariosDto.Add(new UsuarioDto
                {
                    IdUsuario = usuario.IdUsuario,
                    Nombre = usuario.Nombre,
                    Email = usuario.Email,
                    UrlImagen = usuario.UrlImagen,
                    FechaRegistro = usuario.FechaRegistro,
                    Telefono = usuario.Telefono,
                    Plan = usuario.Plan
                });
            }

            return new ResponseDto<IEnumerable<UsuarioDto>>
            {
                Exito = true,
                Data = usuariosDto
            };
        }

        public async Task<ResponseDto<UsuarioDto>> ActualizarUsuarioAsync(Guid id, UsuarioActualizacionDto actualizacionDto)
        {
            var usuario = await _usuarioRepository.GetByIdAsync(id);

            if (usuario == null)
            {
                return new ResponseDto<UsuarioDto>
                {
                    Exito = false,
                    Mensaje = "Usuario no encontrado"
                };
            }

            if (string.IsNullOrWhiteSpace(actualizacionDto.Nombre))
            {
                return new ResponseDto<UsuarioDto>
                {
                    Exito = false,
                    Mensaje = "El nombre es requerido"
                };
            }

            usuario.Nombre = actualizacionDto.Nombre.Trim();
            usuario.Telefono = actualizacionDto.Telefono?.Trim();
            usuario.UrlImagen = actualizacionDto.UrlImagen?.Trim();

            await _usuarioRepository.UpdateAsync(usuario);
            await _usuarioRepository.SaveAsync();

            return new ResponseDto<UsuarioDto>
            {
                Exito = true,
                Mensaje = "Usuario actualizado correctamente",
                Data = new UsuarioDto
                {
                    IdUsuario = usuario.IdUsuario,
                    Nombre = usuario.Nombre,
                    Email = usuario.Email,
                    UrlImagen = usuario.UrlImagen,
                    FechaRegistro = usuario.FechaRegistro,
                    Telefono = usuario.Telefono,
                    Plan = usuario.Plan
                }
            };
        }

        public async Task<bool> ExisteUsuarioAsync(string email)
        {
            return await _usuarioRepository.ExisteUsuarioAsync(email);
        }
    }
}