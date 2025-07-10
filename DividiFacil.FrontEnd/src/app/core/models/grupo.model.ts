
// ✅ DTO PRINCIPAL
export interface GrupoDto {
  idGrupo: string;              
  nombreGrupo: string;          
  descripcion?: string;         
  modoOperacion: string;        
  idUsuarioCreador: string;    
  nombreCreador: string;       
  fechaCreacion: string;        
  codigoAcceso?: string;        
  cantidadMiembros: number;     
  totalGastos: number;         
}

// Interface Grupo (alias para retrocompatibilidad)
export interface Grupo extends GrupoDto {}

// Interfaces de miembros faltantes
export interface MiembroDto {
  idMiembro: string;            
  idUsuario: string;            
  nombre: string;               
  email: string;                
  urlImagen?: string;          
  rol: string;                  
  fechaUnion: string;         
}

export interface MiembroGrupoSimpleDto {
  idMiembro: string;            
  idUsuario: string;           
  nombreUsuario: string;        
  emailUsuario: string;        
  rol: string;                
  fechaUnion: string;         
}

export interface MiembroGrupoDto extends MiembroDto {}

export interface GrupoConMiembrosDto extends GrupoDto {
  miembros: MiembroGrupoSimpleDto[];
}

// ✅ DTO PARA CREAR GRUPOS 
export interface GrupoCreacionDto {
  nombreGrupo: string;          
  descripcion?: string;        
  modoOperacion: string;       
}

// ✅ DTO PARA INVITACIONES
export interface InvitacionDto {
  emailInvitado: string;       
}

// ✅ Interface para cambio de rol
export interface CambioRolDto {
  nuevoRol: string;
}

// ✅ ENUMS PARA CONSISTENCIA
export enum ModoOperacion {
  ESTANDAR = 'Estandar',        
  EQUITATIVO = 'Equitativo',    
  PROPORCIONAL = 'Proporcional' 
}

export enum RolMiembro {
  ADMIN = 'Admin',            
  MIEMBRO = 'Miembro'         
}