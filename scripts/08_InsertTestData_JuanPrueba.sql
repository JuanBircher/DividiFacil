-- Script para asociar el usuario 'Juan Prueba' a datos de prueba en todas las tablas
-- Variables
DECLARE @idJuanPrueba UNIQUEIDENTIFIER = '6E1AD193-24E9-4FC1-A051-F7C9B6E73AFA';

-- Crear 2 grupos y asociar a Juan Prueba
INSERT INTO Grupos (IdGrupo, NombreGrupo, IdUsuarioCreador, FechaCreacion, Descripcion, ModoOperacion, CodigoAcceso)
VALUES
  (NEWID(), 'Grupo Test 1', @idJuanPrueba, GETDATE(), 'Grupo de prueba 1', 'Estandar', 'TEST1'),
  (NEWID(), 'Grupo Test 2', @idJuanPrueba, GETDATE(), 'Grupo de prueba 2', 'CajaComun', 'TEST2');

DECLARE @idGrupo1 UNIQUEIDENTIFIER = (SELECT TOP 1 IdGrupo FROM Grupos WHERE NombreGrupo = 'Grupo Test 1' AND IdUsuarioCreador = @idJuanPrueba);
DECLARE @idGrupo2 UNIQUEIDENTIFIER = (SELECT TOP 1 IdGrupo FROM Grupos WHERE NombreGrupo = 'Grupo Test 2' AND IdUsuarioCreador = @idJuanPrueba);

-- Agregar a Juan Prueba como miembro y admin en ambos grupos
INSERT INTO MiembrosGrupo (IdMiembro, IdUsuario, IdGrupo, Rol, FechaUnion)
VALUES
  (NEWID(), @idJuanPrueba, @idGrupo1, 'Administrador', GETDATE()),
  (NEWID(), @idJuanPrueba, @idGrupo2, 'Administrador', GETDATE());

DECLARE @idMiembroJuan1 UNIQUEIDENTIFIER = (SELECT TOP 1 IdMiembro FROM MiembrosGrupo WHERE IdUsuario = @idJuanPrueba AND IdGrupo = @idGrupo1);
DECLARE @idMiembroJuan2 UNIQUEIDENTIFIER = (SELECT TOP 1 IdMiembro FROM MiembrosGrupo WHERE IdUsuario = @idJuanPrueba AND IdGrupo = @idGrupo2);

-- Agregar solo un miembro adicional a cada grupo (2 participantes por grupo)
-- Elimina miembros extra si existen, solo deja a Juan Prueba y uno más por grupo
DECLARE @idUsuarioAna UNIQUEIDENTIFIER = (SELECT TOP 1 IdUsuario FROM Usuarios WHERE Nombre = 'Ana Gómez');
DECLARE @idUsuarioCarlos UNIQUEIDENTIFIER = (SELECT TOP 1 IdUsuario FROM Usuarios WHERE Nombre = 'Carlos Ruiz');
INSERT INTO MiembrosGrupo (IdMiembro, IdUsuario, IdGrupo, Rol, FechaUnion)
VALUES
  (NEWID(), @idUsuarioAna, @idGrupo1, 'Miembro', GETDATE()),
  (NEWID(), @idUsuarioCarlos, @idGrupo2, 'Miembro', GETDATE());

-- Crear 3 pagos donde Juan Prueba es pagador y/o receptor
INSERT INTO Pagos (IdPago, IdPagador, IdReceptor, IdGrupo, Monto, Concepto, Estado, FechaCreacion)
VALUES
  (NEWID(), @idMiembroJuan1, (SELECT TOP 1 IdMiembro FROM MiembrosGrupo WHERE IdUsuario = @idUsuarioAna AND IdGrupo = @idGrupo1), @idGrupo1, 500, 'Pago test 1', 'Completado', GETDATE()),
  (NEWID(), (SELECT TOP 1 IdMiembro FROM MiembrosGrupo WHERE IdUsuario = @idUsuarioAna AND IdGrupo = @idGrupo1), @idMiembroJuan1, @idGrupo1, 300, 'Pago test 2', 'Pendiente', GETDATE()),
  (NEWID(), @idMiembroJuan2, (SELECT TOP 1 IdMiembro FROM MiembrosGrupo WHERE IdUsuario = @idUsuarioCarlos AND IdGrupo = @idGrupo2), @idGrupo2, 800, 'Pago test 3', 'Completado', GETDATE());

-- Crear gastos y detalles de gasto en ambos grupos
INSERT INTO Gastos (IdGasto, IdGrupo, IdMiembroPagador, Monto, Descripcion, Categoria, FechaCreacion, FechaGasto, ComprobantePath)
VALUES
  (NEWID(), @idGrupo1, @idMiembroJuan1, 1200, 'Gasto test 1', 'Comida', GETDATE(), GETDATE(), NULL),
  (NEWID(), @idGrupo2, @idMiembroJuan2, 2000, 'Gasto test 2', 'Servicios', GETDATE(), GETDATE(), NULL);

DECLARE @idGasto1 UNIQUEIDENTIFIER = (SELECT TOP 1 IdGasto FROM Gastos WHERE Descripcion = 'Gasto test 1' AND IdGrupo = @idGrupo1);
DECLARE @idGasto2 UNIQUEIDENTIFIER = (SELECT TOP 1 IdGasto FROM Gastos WHERE Descripcion = 'Gasto test 2' AND IdGrupo = @idGrupo2);

INSERT INTO DetallesGasto (IdDetalleGasto, IdGasto, IdMiembroDeudor, Monto, Pagado)
VALUES
  (NEWID(), @idGasto1, @idMiembroJuan1, 600, 1),
  (NEWID(), @idGasto1, (SELECT TOP 1 IdMiembro FROM MiembrosGrupo WHERE IdUsuario = @idUsuarioAna AND IdGrupo = @idGrupo1), 600, 0),
  (NEWID(), @idGasto2, @idMiembroJuan2, 1000, 1),
  (NEWID(), @idGasto2, (SELECT TOP 1 IdMiembro FROM MiembrosGrupo WHERE IdUsuario = @idUsuarioCarlos AND IdGrupo = @idGrupo2), 1000, 0);

-- Crear notificaciones para Juan Prueba
INSERT INTO Notificaciones (IdNotificacion, IdUsuario, IdGrupo, Tipo, Mensaje, Estado, FechaCreacion, CanalEnvio)
VALUES
  (NEWID(), @idJuanPrueba, @idGrupo1, 'Pago', 'Has recibido un pago en Grupo Test 1', 'Pendiente', GETDATE(), 'Email'),
  (NEWID(), @idJuanPrueba, @idGrupo2, 'Gasto', 'Nuevo gasto registrado en Grupo Test 2', 'Pendiente', GETDATE(), 'Push');

-- Crear recordatorio para Juan Prueba
INSERT INTO Recordatorios (IdRecordatorio, IdUsuario, IdGrupo, IdReferencia, Titulo, Mensaje, Tipo, FechaCreacion, FechaRecordatorio, Completado, Repetir, FrecuenciaRepeticion, Estado)
VALUES
  (NEWID(), @idJuanPrueba, @idGrupo1, @idGrupo1, 'Pagar cuota', 'Recuerda pagar tu cuota mensual', 'Pago', GETDATE(), DATEADD(day, 3, GETDATE()), 0, 1, 'Mensual', 'Pendiente');

-- Eliminar caja común previa del grupo (si existe)
DELETE FROM CajasComunes WHERE IdGrupo = @idGrupo2;
-- Insertar caja común y movimientos para Grupo Test 2
INSERT INTO CajasComunes (IdCaja, IdGrupo, Saldo, FechaCreacion)
VALUES (NEWID(), @idGrupo2, 3000, GETDATE());
DECLARE @idCajaGrupo2 UNIQUEIDENTIFIER = (SELECT TOP 1 IdCaja FROM CajasComunes WHERE IdGrupo = @idGrupo2);
INSERT INTO MovimientosCaja (IdMovimiento, IdCaja, IdUsuario, Monto, TipoMovimiento, Concepto, Fecha, ComprobantePath)
VALUES
  (NEWID(), @idCajaGrupo2, @idJuanPrueba, 1500, 'Ingreso', 'Aporte inicial', GETDATE(), NULL),
  (NEWID(), @idCajaGrupo2, @idUsuarioCarlos, -500, 'Egreso', 'Compra insumos', GETDATE(), NULL);

-- Eliminar configuración previa del usuario (si existe)
DELETE FROM ConfiguracionesNotificaciones WHERE IdUsuario = @idJuanPrueba;
-- Configuración de notificaciones para Juan Prueba
INSERT INTO ConfiguracionesNotificaciones (IdConfiguracion, IdUsuario, NotificarNuevosPagos, NotificarNuevosGastos, NotificarInvitacionesGrupo, NotificarCambiosEstadoPagos, RecordatoriosDeudas, RecordatoriosPagos, FrecuenciaRecordatorios)
VALUES (NEWID(), @idJuanPrueba, 1, 1, 1, 1, 1, 1, 'Semanal');
