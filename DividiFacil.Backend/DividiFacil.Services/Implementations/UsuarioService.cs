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
                    Telefono = usuario.Telefono
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
                    Telefono = usuario.Telefono
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

            usuario.Nombre = actualizacionDto.Nombre;
            usuario.Telefono = actualizacionDto.Telefono;
            usuario.UrlImagen = actualizacionDto.UrlImagen;

            _usuarioRepository.Update(usuario);
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
                    Telefono = usuario.Telefono
                }
            };
        }

        public async Task<bool> ExisteUsuarioAsync(string email)
        {
            return await _usuarioRepository.ExisteUsuarioAsync(email);
        }
    }
}