-- Script de datos de prueba para DividiFácil (estructura real)
-- Usuarios
INSERT INTO Usuarios (IdUsuario, Nombre, Email, PasswordHash, ProveedorAuth, IdExterno, FechaRegistro, Activo, UrlImagen, TokenNotificacion, Telefono)
VALUES
  (NEWID(), 'Juan Pérez', 'juan.perez@email.com', 'hash1', NULL, NULL, GETDATE(), 1, NULL, NULL, '123456789'),
  (NEWID(), 'Ana Gómez', 'ana.gomez@email.com', 'hash2', 'Google', 'gAna', GETDATE(), 1, 'https://img.com/ana.jpg', 'tokenAna', '987654321'),
  (NEWID(), 'Carlos Ruiz', 'carlos.ruiz@email.com', 'hash3', NULL, NULL, GETDATE(), 1, NULL, NULL, NULL),
  (NEWID(), 'Lucía Torres', 'lucia.torres@email.com', 'hash4', NULL, NULL, GETDATE(), 1, NULL, NULL, '555123456');

-- Grupos
DECLARE @idJuan UNIQUEIDENTIFIER = (SELECT TOP 1 IdUsuario FROM Usuarios WHERE Nombre = 'Juan Pérez');
DECLARE @idAna UNIQUEIDENTIFIER = (SELECT TOP 1 IdUsuario FROM Usuarios WHERE Nombre = 'Ana Gómez');
INSERT INTO Grupos (IdGrupo, NombreGrupo, IdUsuarioCreador, FechaCreacion, Descripcion, ModoOperacion, CodigoAcceso)
VALUES
  (NEWID(), 'Viaje a Bariloche', @idJuan, GETDATE(), 'Grupo para el viaje de amigos', 'Estandar', 'BARI2025'),
  (NEWID(), 'Depto Compartido', @idAna, GETDATE(), 'Gastos del departamento', 'CajaComun', 'DEPTO2025');

-- MiembrosGrupo
DECLARE @idGrupoBariloche UNIQUEIDENTIFIER = (SELECT TOP 1 IdGrupo FROM Grupos WHERE NombreGrupo = 'Viaje a Bariloche');
DECLARE @idGrupoDepto UNIQUEIDENTIFIER = (SELECT TOP 1 IdGrupo FROM Grupos WHERE NombreGrupo = 'Depto Compartido');
INSERT INTO MiembrosGrupo (IdMiembro, IdUsuario, IdGrupo, Rol, FechaUnion)
SELECT NEWID(), IdUsuario, @idGrupoBariloche, 'Administrador', GETDATE() FROM Usuarios WHERE Nombre = 'Juan Pérez';
INSERT INTO MiembrosGrupo (IdMiembro, IdUsuario, IdGrupo, Rol, FechaUnion)
SELECT NEWID(), IdUsuario, @idGrupoBariloche, 'Miembro', GETDATE() FROM Usuarios WHERE Nombre = 'Ana Gómez';
INSERT INTO MiembrosGrupo (IdMiembro, IdUsuario, IdGrupo, Rol, FechaUnion)
SELECT NEWID(), IdUsuario, @idGrupoBariloche, 'Miembro', GETDATE() FROM Usuarios WHERE Nombre = 'Carlos Ruiz';
INSERT INTO MiembrosGrupo (IdMiembro, IdUsuario, IdGrupo, Rol, FechaUnion)
SELECT NEWID(), IdUsuario, @idGrupoDepto, 'Administrador', GETDATE() FROM Usuarios WHERE Nombre = 'Ana Gómez';
INSERT INTO MiembrosGrupo (IdMiembro, IdUsuario, IdGrupo, Rol, FechaUnion)
SELECT NEWID(), IdUsuario, @idGrupoDepto, 'Miembro', GETDATE() FROM Usuarios WHERE Nombre = 'Lucía Torres';

-- Gastos
DECLARE @idMiembroJuan UNIQUEIDENTIFIER = (SELECT TOP 1 IdMiembro FROM MiembrosGrupo WHERE IdUsuario = @idJuan AND IdGrupo = @idGrupoBariloche);
DECLARE @idMiembroAna UNIQUEIDENTIFIER = (SELECT TOP 1 IdMiembro FROM MiembrosGrupo WHERE IdUsuario = @idAna AND IdGrupo = @idGrupoBariloche);
INSERT INTO Gastos (IdGasto, IdGrupo, IdMiembroPagador, Monto, Descripcion, Categoria, FechaCreacion, FechaGasto, ComprobantePath)
VALUES
  (NEWID(), @idGrupoBariloche, @idMiembroJuan, 12000, 'Alquiler cabaña', 'Alojamiento', GETDATE(), GETDATE(), NULL),
  (NEWID(), @idGrupoBariloche, @idMiembroAna, 3000, 'Comida en restaurante', 'Comida', GETDATE(), GETDATE(), NULL);

-- DetallesGasto
DECLARE @idGastoAlquiler UNIQUEIDENTIFIER = (SELECT TOP 1 IdGasto FROM Gastos WHERE Descripcion = 'Alquiler cabaña');
DECLARE @idGastoComida UNIQUEIDENTIFIER = (SELECT TOP 1 IdGasto FROM Gastos WHERE Descripcion = 'Comida en restaurante');
DECLARE @idMiembroCarlos UNIQUEIDENTIFIER = (SELECT TOP 1 IdMiembro FROM MiembrosGrupo WHERE IdUsuario = (SELECT IdUsuario FROM Usuarios WHERE Nombre = 'Carlos Ruiz') AND IdGrupo = @idGrupoBariloche);
INSERT INTO DetallesGasto (IdDetalleGasto, IdGasto, IdMiembroDeudor, Monto, Pagado)
VALUES
  (NEWID(), @idGastoAlquiler, @idMiembroAna, 4000, 0),
  (NEWID(), @idGastoAlquiler, @idMiembroCarlos, 4000, 0),
  (NEWID(), @idGastoAlquiler, @idMiembroJuan, 4000, 1);

-- CajasComunes
INSERT INTO CajasComunes (IdCaja, IdGrupo, Saldo, FechaCreacion)
VALUES (NEWID(), @idGrupoDepto, 5000, GETDATE());
DECLARE @idCajaDepto UNIQUEIDENTIFIER = (SELECT TOP 1 IdCaja FROM CajasComunes WHERE IdGrupo = @idGrupoDepto);

-- MovimientosCaja
DECLARE @idUsuarioAna UNIQUEIDENTIFIER = (SELECT TOP 1 IdUsuario FROM Usuarios WHERE Nombre = 'Ana Gómez');
DECLARE @idUsuarioLucia UNIQUEIDENTIFIER = (SELECT TOP 1 IdUsuario FROM Usuarios WHERE Nombre = 'Lucía Torres');
INSERT INTO MovimientosCaja (IdMovimiento, IdCaja, IdUsuario, Monto, TipoMovimiento, Concepto, Fecha, ComprobantePath)
VALUES
  (NEWID(), @idCajaDepto, @idUsuarioAna, 2500, 'Ingreso', 'Aporte mensual', GETDATE(), NULL),
  (NEWID(), @idCajaDepto, @idUsuarioLucia, -1000, 'Egreso', 'Compra de productos', GETDATE(), NULL);

-- Pagos
DECLARE @idMiembroAnaDepto UNIQUEIDENTIFIER = (SELECT TOP 1 IdMiembro FROM MiembrosGrupo WHERE IdUsuario = @idUsuarioAna AND IdGrupo = @idGrupoDepto);
DECLARE @idMiembroLuciaDepto UNIQUEIDENTIFIER = (SELECT TOP 1 IdMiembro FROM MiembrosGrupo WHERE IdUsuario = @idUsuarioLucia AND IdGrupo = @idGrupoDepto);
INSERT INTO Pagos (IdPago, IdPagador, IdReceptor, IdGrupo, Monto, Concepto, Estado, FechaCreacion)
VALUES
  (NEWID(), @idMiembroAnaDepto, @idMiembroLuciaDepto, @idGrupoDepto, 1500, 'Pago de servicios', 'Completado', GETDATE());

-- Notificaciones
INSERT INTO Notificaciones (IdNotificacion, IdUsuario, IdGrupo, Tipo, Mensaje, Estado, FechaCreacion, CanalEnvio)
VALUES
  (NEWID(), @idUsuarioAna, @idGrupoBariloche, 'Gasto', 'Se ha registrado un nuevo gasto', 'Pendiente', GETDATE(), 'Email');

-- Recordatorios
INSERT INTO Recordatorios (IdRecordatorio, IdUsuario, IdGrupo, IdReferencia, Titulo, Mensaje, Tipo, FechaCreacion, FechaRecordatorio, Completado, Repetir, FrecuenciaRepeticion, Estado)
VALUES
  (NEWID(), @idUsuarioAna, @idGrupoDepto, @idGrupoDepto, 'Pagar alquiler', 'Recuerda pagar el alquiler del mes', 'Pago', GETDATE(), DATEADD(day, 2, GETDATE()), 0, 1, 'Mensual', 'Pendiente');

-- ConfiguracionesNotificaciones
INSERT INTO ConfiguracionesNotificaciones (IdConfiguracion, IdUsuario, NotificarNuevosPagos, NotificarNuevosGastos, NotificarInvitacionesGrupo, NotificarCambiosEstadoPagos, RecordatoriosDeudas, RecordatoriosPagos, FrecuenciaRecordatorios)
SELECT NEWID(), IdUsuario, 1, 1, 1, 1, 1, 1, 'Semanal' FROM Usuarios;
