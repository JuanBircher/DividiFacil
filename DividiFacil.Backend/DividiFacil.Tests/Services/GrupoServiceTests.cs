using DividiFacil.Data.Repositories.Interfaces;
using DividiFacil.Domain.DTOs.Base;
using DividiFacil.Domain.DTOs.Grupo;
using DividiFacil.Domain.Models;
using DividiFacil.Services.Implementations;
using DividiFacil.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using Xunit;
using FluentAssertions;

public class GrupoServiceTests
{
    private readonly Mock<IGrupoRepository> _mockGrupoRepo;
    private readonly Mock<IMiembroGrupoRepository> _mockMiembroRepo;
    private readonly Mock<IUsuarioRepository> _mockUsuarioRepo;
    private readonly Mock<INotificacionService> _mockNotificacionService;
    private readonly Mock<IMemoryCache> _mockCache;
    private readonly GrupoService _service;

    public GrupoServiceTests()
    {
        _mockGrupoRepo = new Mock<IGrupoRepository>();
        _mockMiembroRepo = new Mock<IMiembroGrupoRepository>();
        _mockUsuarioRepo = new Mock<IUsuarioRepository>();
        _mockNotificacionService = new Mock<INotificacionService>();
        _mockCache = new Mock<IMemoryCache>();

        _service = new GrupoService(
            _mockGrupoRepo.Object,
            _mockMiembroRepo.Object,
            _mockUsuarioRepo.Object,
            _mockNotificacionService.Object,
            _mockCache.Object);
    }

    [Fact]
    public async Task CrearGrupoAsync_ConDatosValidos_DebeCrearGrupoYMiembro()
    {
        // Arrange
        var idUsuario = Guid.NewGuid();
        var usuario = new Usuario
        {
            IdUsuario = idUsuario,
            Nombre = "Usuario Test",
            Email = "test@test.com"
        };

        var grupoDto = new GrupoCreacionDto
        {
            NombreGrupo = "Grupo Test",
            Descripcion = "Descripción test",
            ModoOperacion = "Equitativo"
        };

        _mockUsuarioRepo.Setup(x => x.GetByIdAsync(idUsuario))
                       .ReturnsAsync(usuario);

        _mockGrupoRepo.Setup(x => x.CreateAsync(It.IsAny<Grupo>()))
                     .Returns(Task.CompletedTask);

        _mockMiembroRepo.Setup(x => x.CreateAsync(It.IsAny<MiembroGrupo>()))
                       .Returns(Task.CompletedTask);

        _mockGrupoRepo.Setup(x => x.SaveAsync())
                     .Returns(Task.CompletedTask);

        // Act
        var result = await _service.CrearGrupoAsync(grupoDto, idUsuario.ToString());

        // Assert
        result.Should().NotBeNull();
        result.Exito.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data.NombreGrupo.Should().Be("Grupo Test");
        result.Data.IdUsuarioCreador.Should().Be(idUsuario);

        // Verificar que se llamó CreateAsync para el grupo
        _mockGrupoRepo.Verify(x => x.CreateAsync(It.IsAny<Grupo>()), Times.Once);

        // Verificar que se llamó CreateAsync para el miembro (esto es lo que estaba faltando)
        _mockMiembroRepo.Verify(x => x.CreateAsync(It.Is<MiembroGrupo>(m => 
            m.IdUsuario == idUsuario && 
            m.Rol == "Admin")), Times.Once);

        // Verificar que se guardaron los cambios
        _mockGrupoRepo.Verify(x => x.SaveAsync(), Times.Once);
    }

    [Fact]
    public async Task CrearGrupoAsync_ConUsuarioInvalido_DebeRetornarError()
    {
        // Arrange
        var grupoDto = new GrupoCreacionDto
        {
            NombreGrupo = "Grupo Test",
            Descripcion = "Descripción test",
            ModoOperacion = "Equitativo"
        };

        // Act
        var result = await _service.CrearGrupoAsync(grupoDto, "invalid-guid");

        // Assert
        result.Should().NotBeNull();
        result.Exito.Should().BeFalse();
        result.Mensaje.Should().Be("ID de usuario inválido");
    }
}