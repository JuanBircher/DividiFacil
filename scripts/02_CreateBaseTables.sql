USE DividiFacil;
GO

-- Tabla de Usuarios
CREATE TABLE Usuarios (
  IdUsuario UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  Nombre NVARCHAR(100) NOT NULL,
  Email NVARCHAR(255) UNIQUE NOT NULL,
  PasswordHash NVARCHAR(255) NULL, -- Para usuarios registrados normalmente
  ProveedorAuth NVARCHAR(50) NULL,  -- Google, Facebook, etc.
  IdExterno NVARCHAR(100) NULL,     -- ID del proveedor externo
  FechaRegistro DATETIME DEFAULT GETDATE(),
  Activo BIT DEFAULT 1,
  UrlImagen NVARCHAR(500) NULL,
  TokenNotificacion NVARCHAR(500) NULL, -- Para push notifications
  Telefono NVARCHAR(20) NULL            -- Para notificaciones WhatsApp
);

-- Tabla de Grupos
CREATE TABLE Grupos (
  IdGrupo UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  NombreGrupo NVARCHAR(100) NOT NULL,
  IdUsuarioCreador UNIQUEIDENTIFIER NOT NULL,
  FechaCreacion DATETIME DEFAULT GETDATE(),
  Descripcion NVARCHAR(500) NULL,
  ModoOperacion NVARCHAR(50) DEFAULT 'Estandar', -- Estandar, Pareja, Roommates
  CodigoAcceso NVARCHAR(20) NULL, -- Para acceso rápido sin registro
  FOREIGN KEY (IdUsuarioCreador) REFERENCES Usuarios(IdUsuario)
);

-- Tabla de Miembros de Grupo
CREATE TABLE MiembrosGrupo (
  IdMiembro UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  IdUsuario UNIQUEIDENTIFIER NOT NULL,
  IdGrupo UNIQUEIDENTIFIER NOT NULL,
  Rol NVARCHAR(50) DEFAULT 'Miembro', -- Admin, Miembro
  FechaUnion DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario),
  FOREIGN KEY (IdGrupo) REFERENCES Grupos(IdGrupo),
  UNIQUE (IdUsuario, IdGrupo) -- Un usuario solo puede estar una vez en un grupo
);