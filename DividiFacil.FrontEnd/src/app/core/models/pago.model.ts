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
  comprobantePath?: string;
  motivoRechazo?: string;
  // Propiedades calculadas del backend
  nombreGrupo?: string;
  nombrePagador?: string;
  nombreReceptor?: string;
}