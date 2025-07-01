export interface EstadisticasUsuarioDto {
  totalGrupos: number;
  balanceTotal: number;
  gastosDelMes: number;
  notificacionesPendientes: number;
  gastosAprobados: number;
  gastosPendientes: number;
  pagosRealizados: number;
  pagosRecibidos: number;
}

export interface EstadisticasCajaDto {
  idCajaComun: string;
  nombreCaja: string;
  saldoActual: number;
  totalIngresos: number;
  totalEgresos: number;
  cantidadMovimientos: number;
  promedioMovimientos: number;
  ultimoMovimiento?: string;
}