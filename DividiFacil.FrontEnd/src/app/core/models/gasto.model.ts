export interface Gasto {
  idGasto: string;
  idGrupo: string;
  descripcion: string;
  monto: number;
  fechaCreacion: string;
  idMiembroPagador: string;
  detalleGastos: DetalleGasto[];
}

export interface DetalleGasto {
  idDetalleGasto: string;
  idGasto: string;
  idMiembroDeudor: string;
  monto: number;
  pagado: boolean;
}

// DTOs para el frontend
export interface GastoCreacionDto {
  idGrupo: string;
  descripcion: string;
  monto: number;
  categoria?: string;
  fechaGasto?: string;
  comprobantePath?: string;
  detalles: DetalleGastoCreacionDto[];
}

export interface DetalleGastoCreacionDto {
  idMiembroDeudor: string;
  monto: number;
}

/**
 * 🔧 CORREGIDO: Estructura que coincide EXACTAMENTE con el backend
 */
export interface GastoDto {
  idGasto: string;
  idGrupo: string;
  nombreGrupo: string;
  descripcion: string;
  idMiembroPagador: string;
  nombreMiembroPagador: string;
  monto: number;
  categoria?: string;
  fechaCreacion: string;
  fechaGasto: string;
  comprobantePath?: string;
  detalles?: DetalleGastoDto[];
}

/**
 * 🔧 CORREGIDO: Estructura que coincide EXACTAMENTE con el backend
 */
export interface DetalleGastoDto {
  idDetalleGasto: string;
  idMiembroDeudor: string;
  nombreMiembroDeudor: string;
  monto: number;
  pagado: boolean;
}

// Interfaces adicionales para funcionalidad completa
export interface MiembroParticipanteDto {
  idMiembro: string;
  monto?: number;
  porcentaje?: number;
}