export interface BalanceGrupoDto {
  idGrupo: string;
  nombreGrupo: string;
  totalGastos: number;
  balancesUsuarios: BalanceUsuarioDto[];
  deudasSimplificadas: DeudaSimplificadaDto[];
}

export interface BalanceUsuarioDto {
  idMiembro: string;
  idUsuario: string;
  nombreUsuario: string;
  imagenPerfil: string;
  totalPagado: number;
  deberiaHaberPagado: number;
  balance: number;
  deudasDetalladas: DeudaDetalladaDto[];
}

export interface DeudaSimplificadaDto {
  idUsuarioDeudor: string;
  nombreUsuarioDeudor: string;
  imagenPerfilDeudor: string;
  idUsuarioAcreedor: string;
  nombreUsuarioAcreedor: string;
  imagenPerfilAcreedor: string;
  monto: number;
}

export interface DeudaDetalladaDto {
  idUsuarioDeudor: string;
  nombreUsuarioDeudor: string;
  idUsuarioAcreedor: string;
  nombreUsuarioAcreedor: string;
  monto: number;
  origenes: DeudaOrigenDto[];
}

export interface DeudaOrigenDto {
  idGasto: string;
  descripcionGasto: string;
  fechaGasto: string;
  montoOriginal: number;
}

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
  idGrupo?: string;
  nombreGrupo?: string;
}