export interface EstadisticasDto {
  totalGastos: number;                  // decimal -> number
  totalPagos: number;                   // decimal -> number
  gastosPorCategoria: { [key: string]: number };
  gastosPorMes: { [key: string]: number };
  saldoTotal: number;                   // decimal -> number
  gruposActivos: number;                // ✅ Correcto
  deudaTotal: number;                   // decimal -> number
  creditoTotal: number;                 // decimal -> number
}

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