USE DividiFacil;
GO

-- Tabla de Gastos
CREATE TABLE Gastos (
  IdGasto UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  IdGrupo UNIQUEIDENTIFIER NOT NULL,
  IdPagador UNIQUEIDENTIFIER NOT NULL,
  Monto DECIMAL(18,2) NOT NULL,
  Concepto NVARCHAR(200) NOT NULL,
  Fecha DATETIME DEFAULT GETDATE(),
  TipoGasto NVARCHAR(50) DEFAULT 'Normal', -- Normal, Recurrente, Rotativo
  FechaVencimiento DATETIME NULL,         -- Para gastos recurrentes
  ComprobantePath NVARCHAR(500) NULL,     -- Para adjuntar comprobantes
  FOREIGN KEY (IdGrupo) REFERENCES Grupos(IdGrupo),
  FOREIGN KEY (IdPagador) REFERENCES Usuarios(IdUsuario)
);

-- Tabla de Detalles de Gasto (quién debe qué)
CREATE TABLE DetallesGasto (
  IdDetalle UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  IdGasto UNIQUEIDENTIFIER NOT NULL,
  IdUsuario UNIQUEIDENTIFIER NOT NULL,
  MontoDebe DECIMAL(18,2) NOT NULL,
  Estado NVARCHAR(50) DEFAULT 'Pendiente', -- Pendiente, Pagado, Confirmado
  FechaPago DATETIME NULL,
  FOREIGN KEY (IdGasto) REFERENCES Gastos(IdGasto),
  FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario)
);

-- Tabla de Caja Común
CREATE TABLE CajaComun (
  IdCaja UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  IdGrupo UNIQUEIDENTIFIER UNIQUE NOT NULL, -- Un grupo solo tiene una caja común
  Saldo DECIMAL(18,2) DEFAULT 0,
  FechaCreacion DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (IdGrupo) REFERENCES Grupos(IdGrupo)
);

-- Tabla de Movimientos de Caja
CREATE TABLE MovimientosCaja (
  IdMovimiento UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  IdCaja UNIQUEIDENTIFIER NOT NULL,
  IdUsuario UNIQUEIDENTIFIER NOT NULL,
  Monto DECIMAL(18,2) NOT NULL,
  TipoMovimiento NVARCHAR(50) NOT NULL, -- Ingreso, Egreso
  Concepto NVARCHAR(200) NOT NULL,
  Fecha DATETIME DEFAULT GETDATE(),
  ComprobantePath NVARCHAR(500) NULL,
  FOREIGN KEY (IdCaja) REFERENCES CajaComun(IdCaja),
  FOREIGN KEY (IdUsuario) REFERENCES Usuarios(IdUsuario)
);