export interface Pago {
  idPago: string;
  idGrupo: string;
  idPagador: string;
  idReceptor: string;
  monto: number;
  concepto: string;
  estado: 'Pendiente' | 'Completado' | 'Rechazado';
  fechaCreacion: string;
  fechaConfirmacion?: string;
}

export interface PagoCreacionDto {
  idGrupo: string;
  idReceptor: string;
  monto: number;
  concepto: string;
}

export interface PagoDto {
  idPago: string;
  idGrupo: string;
  nombreGrupo: string;
  nombrePagador: string;
  nombreReceptor: string;
  monto: number;
  concepto: string;
  estado: string;
  fechaCreacion: string;
  fechaConfirmacion?: string;
}