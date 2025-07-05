export interface CajaComunDto {
  idCaja: string;
  idGrupo: string;
  nombreGrupo: string;
  saldo: number;
  fechaCreacion: string;
  totalIngresos: number;
  totalEgresos: number;
}

export interface MovimientoCajaDto {
  idMovimiento: string;
  idCaja: string;
  idUsuario: string;
  nombreUsuario: string;
  monto: number;
  tipoMovimiento: string; // "Ingreso" o "Egreso"
  concepto: string;
  fecha: string;
  comprobantePath?: string;
}

export interface MovimientoCajaCreacionDto {
  idCaja: string;
  monto: number;
  tipoMovimiento: string; // "Ingreso" o "Egreso"
  concepto: string;
  comprobantePath?: string;
}