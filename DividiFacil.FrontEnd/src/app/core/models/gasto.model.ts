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
  tipoDistribucion: 'IGUAL' | 'PORCENTAJE' | 'MANUAL';
  miembrosParticipantes: MiembroParticipanteDto[];
}

export interface MiembroParticipanteDto {
  idMiembro: string;
  monto?: number;
  porcentaje?: number;
}

export interface GastoDto {
  idGasto: string;
  descripcion: string;
  monto: number;
  fechaCreacion: string;
  nombrePagador: string;
  detalles: DetalleGastoDto[];
}

export interface DetalleGastoDto {
  idDetalleGasto: string;
  idMiembroDeudor: string;
  nombreMiembroDeudor: string;
  monto: number;
  pagado: boolean;
}