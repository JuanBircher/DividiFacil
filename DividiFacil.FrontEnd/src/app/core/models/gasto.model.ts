

// ✅ INTERFACE PRINCIPAL 
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

// ✅ DTO PARA CREACIÓN
export interface GastoCreacionDto {
  idGrupo: string;                     
  monto: number;                       
  descripcion: string;                  
  categoria: string;                   
  fechaGasto?: string;                  
  comprobantePath?: string;             
  detalles: DetalleGastoCreacionDto[];
}

// ✅ DTO PARA DETALLES 
export interface DetalleGastoDto {
  idDetalleGasto: string;              
  idMiembroDeudor: string;              
  nombreMiembroDeudor: string;          
  monto: number;                      
  pagado: boolean;                     
}

// ✅ DTO PARA CREACIÓN DE DETALLES 
export interface DetalleGastoCreacionDto {
  idMiembroDeudor: string;              
  monto: number;                       
}

// ✅ DTO PARA SALDOS 
export interface SaldoUsuarioDto {
  idUsuario: string;                    
  nombreUsuario: string;                
  imagenPerfil?: string;               
  totalPagado: number;                 
  totalAPagar: number;                  
  saldo: number;                        
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