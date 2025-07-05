// src/app/core/models/gasto.model.ts
// 🔧 MODELOS TOTALMENTE ALINEADOS CON BACKEND

// ✅ INTERFACE PRINCIPAL - EXACTAMENTE IGUAL AL BACKEND
export interface GastoDto {
  idGasto: string;                      // Guid -> string
  idGrupo: string;                      // Guid -> string
  nombreGrupo: string;                  // ✅ Correcto
  descripcion: string;                  // ✅ Correcto
  idMiembroPagador: string;             // Guid -> string
  nombreMiembroPagador: string;         // ✅ Correcto
  monto: number;                        // decimal -> number
  categoria?: string;                   // ✅ Correcto
  fechaCreacion: string;                // DateTime -> string (ISO format)
  fechaGasto: string;                   // DateTime -> string (ISO format)
  comprobantePath?: string;             // ✅ Correcto
  detalles?: DetalleGastoDto[];         // ✅ Correcto
}

// ✅ DTO PARA CREACIÓN - EXACTAMENTE IGUAL AL BACKEND
export interface GastoCreacionDto {
  idGrupo: string;                      // Guid -> string
  monto: number;                        // decimal -> number
  descripcion: string;                  // ✅ Correcto
  categoria: string;                    // ✅ Correcto
  fechaGasto?: string;                  // DateTime -> string (ISO format)
  comprobantePath?: string;             // ✅ Correcto
  detalles: DetalleGastoCreacionDto[];  // ✅ Correcto
}

// ✅ DTO PARA DETALLES - EXACTAMENTE IGUAL AL BACKEND
export interface DetalleGastoDto {
  idDetalleGasto: string;               // Guid -> string
  idMiembroDeudor: string;              // Guid -> string
  nombreMiembroDeudor: string;          // ✅ Correcto
  monto: number;                        // decimal -> number
  pagado: boolean;                      // ✅ Correcto
}

// ✅ DTO PARA CREACIÓN DE DETALLES - EXACTAMENTE IGUAL AL BACKEND
export interface DetalleGastoCreacionDto {
  idMiembroDeudor: string;              // Guid -> string
  monto: number;                        // decimal -> number
}

// ✅ DTO PARA SALDOS - EXACTAMENTE IGUAL AL BACKEND
export interface SaldoUsuarioDto {
  idUsuario: string;                    // Guid -> string
  nombreUsuario: string;                // ✅ Correcto
  imagenPerfil?: string;                // ✅ Correcto
  totalPagado: number;                  // decimal -> number
  totalAPagar: number;                  // decimal -> number
  saldo: number;                        // decimal -> number
}

// ✅ INTERFACES AUXILIARES PARA FORMULARIOS
export interface ParticipanteGasto {
  idMiembro: string;
  nombre: string;
  monto: number;
  porcentaje: number;
  seleccionado: boolean;
}

export interface FiltrosGasto {
  pagina: number;
  tamanioPagina: number;
  busqueda?: string;
  ordenamiento?: string;
}

// ✅ ENUMS PARA CONSISTENCIA
export enum TipoGasto {
  EQUITATIVO = 'Equitativo',
  PROPORCIONAL = 'Proporcional',
  PERSONALIZADO = 'Personalizado'
}

export enum EstadoGasto {
  PENDIENTE = 'Pendiente',
  PAGADO = 'Pagado',
  PARCIAL = 'Parcial'
}

export enum CategoriaGasto {
  ALIMENTACION = 'Alimentación',
  TRANSPORTE = 'Transporte',
  ENTRETENIMIENTO = 'Entretenimiento',
  SERVICIOS = 'Servicios',
  COMPRAS = 'Compras',
  SALUD = 'Salud',
  VIAJES = 'Viajes',
  OTROS = 'Otros'
}

// ✅ INTERFACE LEGACY PARA COMPATIBILIDAD
export interface Gasto {
  idGasto: string;
  idGrupo: string;
  descripcion: string;
  monto: number;
  fechaCreacion: string;
  fechaGasto: string;
  categoria?: string;
  comprobantePath?: string;
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