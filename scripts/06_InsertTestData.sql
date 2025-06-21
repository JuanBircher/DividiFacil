USE DividiFacil;
GO

-- Insertar usuarios de prueba
INSERT INTO Usuarios (IdUsuario, Nombre, Email, PasswordHash)
VALUES
    (NEWID(), 'Juan Pérez', 'juan@example.com', 'hashsimulado123'),
    (NEWID(), 'María López', 'maria@example.com', 'hashsimulado456'),
    (NEWID(), 'Carlos Rodríguez', 'carlos@example.com', 'hashsimulado789');

-- Guardar los IDs para usarlos después
DECLARE @IdJuan UNIQUEIDENTIFIER = (SELECT IdUsuario FROM Usuarios WHERE Email = 'juan@example.com');
DECLARE @IdMaria UNIQUEIDENTIFIER = (SELECT IdUsuario FROM Usuarios WHERE Email = 'maria@example.com');
DECLARE @IdCarlos UNIQUEIDENTIFIER = (SELECT IdUsuario FROM Usuarios WHERE Email = 'carlos@example.com');

-- Crear un grupo de prueba
DECLARE @IdGrupo UNIQUEIDENTIFIER = NEWID();
INSERT INTO Grupos (IdGrupo, NombreGrupo, IdUsuarioCreador, Descripcion, CodigoAcceso)
VALUES (@IdGrupo, 'Viaje a Mendoza', @IdJuan, 'Gastos del viaje a Mendoza de Octubre', 'MEND2025');

-- Agregar miembros al grupo
INSERT INTO MiembrosGrupo (IdUsuario, IdGrupo, Rol)
VALUES
    (@IdJuan, @IdGrupo, 'Admin'),
    (@IdMaria, @IdGrupo, 'Miembro'),
    (@IdCarlos, @IdGrupo, 'Miembro');

-- Crear gastos de ejemplo
DECLARE @IdGasto1 UNIQUEIDENTIFIER = NEWID();
INSERT INTO Gastos (IdGasto, IdGrupo, IdPagador, Monto, Concepto)
VALUES (@IdGasto1, @IdGrupo, @IdJuan, 3000, 'Combustible');

DECLARE @IdGasto2 UNIQUEIDENTIFIER = NEWID();
INSERT INTO Gastos (IdGasto, IdGrupo, IdPagador, Monto, Concepto)
VALUES (@IdGasto2, @IdGrupo, @IdMaria, 5000, 'Hospedaje');

-- Crear detalles de gastos
INSERT INTO DetallesGasto (IdGasto, IdUsuario, MontoDebe)
VALUES
    (@IdGasto1, @IdMaria, 1000),
    (@IdGasto1, @IdCarlos, 1000),
    (@IdGasto2, @IdJuan, 1667),
    (@IdGasto2, @IdCarlos, 1667);

-- Crear caja común
DECLARE @IdCaja UNIQUEIDENTIFIER = NEWID();
INSERT INTO CajaComun (IdCaja, IdGrupo, Saldo)
VALUES (@IdCaja, @IdGrupo, 2000);

-- Crear movimientos en la caja
INSERT INTO MovimientosCaja (IdCaja, IdUsuario, Monto, TipoMovimiento, Concepto)
VALUES
    (@IdCaja, @IdJuan, 1000, 'Ingreso', 'Aporte inicial'),
    (@IdCaja, @IdMaria, 1000, 'Ingreso', 'Aporte inicial'),
    (@IdCaja, @IdJuan, 500, 'Egreso', 'Compra de snacks');