export interface CajaComunDto {
  idCajaComun: string;
  idGrupo: string;
  nombreCaja: string;
  descripcion: string;
  saldoActual: number;
  fechaCreacion: string;
  nombreGrupo: string;
}

export interface MovimientoCajaDto {
  idMovimiento: string;
  idCajaComun: string;
  tipoMovimiento: 'INGRESO' | 'EGRESO';
  concepto: string;
  monto: number;
  fechaMovimiento: string;
  idUsuarioCreador: string;
  nombreUsuarioCreador: string;
  saldoAnterior: number;
  saldoNuevo: number;
}

export interface MovimientoCajaCreacionDto {
  idCajaComun: string;
  tipoMovimiento: 'INGRESO' | 'EGRESO';
  concepto: string;
  monto: number;
}