USE DividiFacil;
GO

-- Tabla de Notificaciones
CREATE TABLE Notificaciones (
  IdNotificacion UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  IdUsuario UNIQUEIDENTIFIER NOT NULL,
  IdGrupo UNIQUEIDENTIFIER NOT NULL,
  Tipo NVARCHAR(50) NOT NULL, -- Recordatorio, Bienvenida, Pago
  Mensaje NVARCHAR(1000) NOT NULL,
  Estado NVARCHAR(50) DEFAULT 'Pendiente', -- Pendiente, Enviado, Fallido
  FechaCreacion DATETIME DEFAULT GETDATE(),
  FechaEnvio DATETIME NULL,
  CanalEnvio NVARCHAR(50) DEFAULT 'Email', -- Email, WhatsApp, SMS
  FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario),
  FOREIGN KEY (IdGrupo) REFERENCES Grupos(IdGrupo)
);