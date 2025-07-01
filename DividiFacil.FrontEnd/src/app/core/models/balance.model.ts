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
  idGasto: string;
  descripcionGasto: string;
  montoDeuda: number;
  fechaGasto: string;
}

export interface MovimientoDto {
  idMovimiento: string;
  tipoMovimiento: 'Gasto' | 'Pago';
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