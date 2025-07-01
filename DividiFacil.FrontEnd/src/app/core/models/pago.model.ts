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
  idReceptor: string;
  idGrupo?: string;
  monto: number;
  concepto: string;
  comprobantePath?: string;
}

/**
 * 🔧 CORREGIDO: Estructura que coincide EXACTAMENTE con el backend
 */
export interface PagoDto {
  idPago: string;
  idPagador: string;
  nombrePagador: string;
  idReceptor: string;
  nombreReceptor: string;
  monto: number;
  concepto: string;
  fechaCreacion: string;
  fechaConfirmacion?: string;
  estado: string;
  idGrupo: string;
  nombreGrupo?: string;
  comprobantePath?: string;
  motivoRechazo?: string;
}