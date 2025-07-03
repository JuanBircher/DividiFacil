// ✅ ALINEADO CON BACKEND BalanceGrupoDto.cs
export interface BalanceGrupoDto {
  idGrupo: string;
  nombreGrupo: string;
  totalGastos: number;
  balancesUsuarios: BalanceUsuarioDto[];        // ✅ Nombre correcto
  deudasSimplificadas: DeudaSimplificadaDto[];  // ✅ Nombre correcto
}

// ✅ ALINEADO CON BACKEND BalanceUsuarioDto.cs
export interface BalanceUsuarioDto {
  idMiembro: string;
  idUsuario: string;
  nombreUsuario: string;
  imagenPerfil: string;
  totalPagado: number;           // ✅ Campo correcto del backend
  totalGastado: number;          // ✅ Campo para el total gastado
  deberiaHaberPagado: number;    // ✅ Campo correcto del backend
  balance: number;
  deudasDetalladas: DeudaDetalladaDto[];
  deudas: DeudaDetalladaDto[];   // ✅ Campo para deudas
  creditos: DeudaDetalladaDto[]; // ✅ Campo para créditos
}

// ✅ ALINEADO CON BACKEND DeudaSimplificadaDto.cs
export interface DeudaSimplificadaDto {
  idUsuarioDeudor: string;
  nombreUsuarioDeudor: string;
  imagenPerfilDeudor: string;
  idUsuarioAcreedor: string;
  nombreUsuarioAcreedor: string;
  imagenPerfilAcreedor: string;
  monto: number;
}

// ✅ ALINEADO CON BACKEND DeudaDetalladaDto.cs
export interface DeudaDetalladaDto {
  idGasto: string;
  conceptoGasto: string;
  fechaGasto: string;
  montoTotal: number;
  montoCorresponde: number;
  montoPagado: number;
  montoPendiente: number;
  origenesDeuda: DeudaOrigenDto[];
}

// ✅ ALINEADO CON BACKEND DeudaOrigenDto.cs
export interface DeudaOrigenDto {
  idGasto: string;
  conceptoGasto: string;
  fechaGasto: string;
  montoGasto: number;
  participacionUsuario: number;
  montoPagadoUsuario: number;
}

// ✅ NUEVO: MovimientoDto para historial
export interface MovimientoDto {
  idMovimiento: string;
  tipoMovimiento: string;
  concepto: string;
  fechaCreacion: string;
  monto: number;
  estado: string;
  idUsuarioRelacionado: string;
  nombreUsuarioRelacionado: string;
  imagenPerfilRelacionado?: string;
  esPropio: boolean;
  idGrupo: string;
  nombreGrupo: string;
}