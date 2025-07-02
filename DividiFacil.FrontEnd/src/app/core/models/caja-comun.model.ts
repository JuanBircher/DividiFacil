export interface CajaComunDto {
  idCaja: string;              // 🔧 CORREGIDO: era idCajaComun
  idGrupo: string;
  nombreCaja: string;          // 🔧 NOTA: Esta propiedad puede venir de join con Grupo
  descripcion: string;         // 🔧 NOTA: Esta propiedad puede venir de join con Grupo
  saldo: number;               // 🔧 CORREGIDO: era saldoActual
  fechaCreacion: string;
  nombreGrupo: string;         // 🔧 NOTA: Esta propiedad viene de join
}

export interface MovimientoCajaDto {
  idMovimiento: string;
  idCaja: string;              // 🔧 CORREGIDO: era idCajaComun
  tipoMovimiento: 'INGRESO' | 'EGRESO';
  concepto: string;
  monto: number;
  fecha: string;               // 🔧 CORREGIDO: era fechaMovimiento
  idUsuario: string;           // 🔧 CORREGIDO: era idUsuarioCreador
  nombreUsuario: string;       // 🔧 CORREGIDO: era nombreUsuarioCreador
  comprobantePath?: string;    // 🔧 AGREGADO: existe en backend
  saldoAnterior?: number;      // 🔧 OPCIONAL: calculado
  saldoNuevo?: number;         // 🔧 OPCIONAL: calculado
}

export interface MovimientoCajaCreacionDto {
  idCaja: string;              // 🔧 CORREGIDO: era idCajaComun
  tipoMovimiento: 'INGRESO' | 'EGRESO';
  concepto: string;
  monto: number;
}