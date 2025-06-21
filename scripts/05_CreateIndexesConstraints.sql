USE DividiFacil;
GO

-- Índices para optimizar consultas frecuentes
CREATE INDEX IX_MiembrosGrupo_IdUsuario ON MiembrosGrupo(IdUsuario);
CREATE INDEX IX_MiembrosGrupo_IdGrupo ON MiembrosGrupo(IdGrupo);
CREATE INDEX IX_Gastos_IdGrupo ON Gastos(IdGrupo);
CREATE INDEX IX_DetallesGasto_IdGasto ON DetallesGasto(IdGasto);
CREATE INDEX IX_DetallesGasto_IdUsuario ON DetallesGasto(IdUsuario);
CREATE INDEX IX_DetallesGasto_Estado ON DetallesGasto(Estado);
CREATE INDEX IX_Notificaciones_IdUsuario ON Notificaciones(IdUsuario);
CREATE INDEX IX_Notificaciones_Estado ON Notificaciones(Estado);

-- Restricción para prevenir borrados en cascada no controlados
ALTER TABLE MiembrosGrupo
ADD CONSTRAINT FK_MiembrosGrupo_Usuarios
FOREIGN KEY (IdUsuario)
REFERENCES Usuarios(IdUsuario)
ON DELETE NO ACTION;

ALTER TABLE MiembrosGrupo
ADD CONSTRAINT FK_MiembrosGrupo_Grupos
FOREIGN KEY (IdGrupo)
REFERENCES Grupos(IdGrupo)
ON DELETE NO ACTION;