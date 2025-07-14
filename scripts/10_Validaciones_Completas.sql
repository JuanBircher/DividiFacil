-- Script: 10_Validaciones_Completas.sql
-- Ejecuta este script después de cargar los datos de prueba para validar integridad y relaciones

-- 1. Usuario principal
SELECT 'Usuario principal', * FROM Usuarios WHERE Email = 'prueba@test.com';

-- 2. Grupos de Juan Prueba
SELECT 'Grupos de Juan Prueba', * FROM Grupos WHERE IdUsuarioCreador = '6E1AD193-24E9-4FC1-A051-F7C9B6E73AFA';

-- 3. Miembros de cada grupo
SELECT 'Miembros de grupo', mg.IdMiembro, mg.IdGrupo, g.NombreGrupo, u.Nombre AS NombreUsuario, mg.Rol
FROM MiembrosGrupo mg
JOIN Usuarios u ON mg.IdUsuario = u.IdUsuario
JOIN Grupos g ON mg.IdGrupo = g.IdGrupo;

-- 4. Cajas comunes por grupo
SELECT 'Cajas comunes', c.IdCaja, c.IdGrupo, g.NombreGrupo, c.Saldo
FROM CajasComunes c
JOIN Grupos g ON c.IdGrupo = g.IdGrupo;

-- 5. Gastos y pagadores
SELECT 'Gastos', ga.IdGasto, ga.Descripcion, ga.Monto, g.NombreGrupo, u.Nombre AS Pagador
FROM Gastos ga
JOIN Grupos g ON ga.IdGrupo = g.IdGrupo
JOIN MiembrosGrupo mg ON ga.IdMiembroPagador = mg.IdMiembro
JOIN Usuarios u ON mg.IdUsuario = u.IdUsuario;

-- 6. Detalles de gastos
SELECT 'Detalles de gasto', dg.IdDetalleGasto, ga.Descripcion, u.Nombre AS Deudor, dg.Monto, dg.Pagado
FROM DetallesGasto dg
JOIN Gastos ga ON dg.IdGasto = ga.IdGasto
JOIN MiembrosGrupo mg ON dg.IdMiembroDeudor = mg.IdMiembro
JOIN Usuarios u ON mg.IdUsuario = u.IdUsuario;

-- 7. Pagos
SELECT 'Pagos', p.IdPago, u1.Nombre AS Pagador, u2.Nombre AS Receptor, g.NombreGrupo, p.Monto, p.Estado
FROM Pagos p
JOIN MiembrosGrupo mpg ON p.IdPagador = mpg.IdMiembro
JOIN Usuarios u1 ON mpg.IdUsuario = u1.IdUsuario
JOIN MiembrosGrupo mrc ON p.IdReceptor = mrc.IdMiembro
JOIN Usuarios u2 ON mrc.IdUsuario = u2.IdUsuario
JOIN Grupos g ON p.IdGrupo = g.IdGrupo;

-- 8. Notificaciones de Juan Prueba
SELECT 'Notificaciones', * FROM Notificaciones WHERE IdUsuario = '6E1AD193-24E9-4FC1-A051-F7C9B6E73AFA';

-- 9. Recordatorios de Juan Prueba
SELECT 'Recordatorios', * FROM Recordatorios WHERE IdUsuario = '6E1AD193-24E9-4FC1-A051-F7C9B6E73AFA';

-- 10. Movimientos de caja de Juan Prueba
SELECT 'Movimientos de caja', mc.*, g.NombreGrupo
FROM MovimientosCaja mc
JOIN CajasComunes c ON mc.IdCaja = c.IdCaja
JOIN Grupos g ON c.IdGrupo = g.IdGrupo
WHERE mc.IdUsuario = '6E1AD193-24E9-4FC1-A051-F7C9B6E73AFA';

-- 11. Configuración de notificaciones de Juan Prueba
SELECT 'Configuración notificaciones', * FROM ConfiguracionesNotificaciones WHERE IdUsuario = '6E1AD193-24E9-4FC1-A051-F7C9B6E73AFA';

-- 12. Integridad referencial cruzada
SELECT 'DetallesGasto sin Miembro', dg.IdMiembroDeudor FROM DetallesGasto dg LEFT JOIN MiembrosGrupo mg ON dg.IdMiembroDeudor = mg.IdMiembro WHERE mg.IdMiembro IS NULL;
SELECT 'Pagos sin Miembro pagador', p.IdPagador FROM Pagos p LEFT JOIN MiembrosGrupo mg ON p.IdPagador = mg.IdMiembro WHERE mg.IdMiembro IS NULL;
SELECT 'Pagos sin Miembro receptor', p.IdReceptor FROM Pagos p LEFT JOIN MiembrosGrupo mg ON p.IdReceptor = mg.IdMiembro WHERE mg.IdMiembro IS NULL;

-- 13. Consistencia de saldos
SELECT 'Consistencia de saldos', c.IdCaja, c.Saldo, SUM(m.Monto) AS SumaMovimientos
FROM CajasComunes c
LEFT JOIN MovimientosCaja m ON c.IdCaja = m.IdCaja
GROUP BY c.IdCaja, c.Saldo;

-- 14. Pagos pendientes
SELECT 'Pagos pendientes', * FROM Pagos WHERE Estado = 'Pendiente';

-- 15. Gastos sin detalles
SELECT 'Gastos sin detalles', g.IdGasto, g.Descripcion
FROM Gastos g
LEFT JOIN DetallesGasto d ON g.IdGasto = d.IdGasto
GROUP BY g.IdGasto, g.Descripcion
HAVING COUNT(d.IdDetalleGasto) = 0;

-- 16. Usuarios sin configuración de notificaciones
SELECT 'Usuarios sin configuración', u.IdUsuario, u.Nombre
FROM Usuarios u
LEFT JOIN ConfiguracionesNotificaciones c ON u.IdUsuario = c.IdUsuario
WHERE c.IdUsuario IS NULL;
