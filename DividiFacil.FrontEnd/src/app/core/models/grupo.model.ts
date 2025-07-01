export interface Grupo {
  idGrupo: string;
  nombreGrupo: string;
  descripcion?: string;
  fechaCreacion: string;
  codigoAcceso: string;      
  modoOperacion: string;     
  idUsuarioCreacion: string;
}

// ✅ MANTENER DTOs existentes - coinciden con backend
export interface GrupoCreacionDto {
  nombreGrupo: string;
  descripcion?: string;
  modoOperacion: string;
}

/**
 * 🔧 CORREGIDO: Estructura que coincide EXACTAMENTE con el backend
 */
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

/**
 * 🔧 CORREGIDO: Estructura que coincide con el backend
 */
export interface GrupoConMiembrosDto {
  idGrupo: string;
  nombreGrupo: string;
  descripcion?: string;
  modoOperacion: string;
  idUsuarioCreador: string;
  nombreCreador: string;
  fechaCreacion: string;
  codigoAcceso?: string;
  totalGastos: number;
  miembros: MiembroGrupoSimpleDto[];
}

/**
 * 🔧 NUEVO: Estructura que coincide con el backend
 */
export interface MiembroGrupoSimpleDto {
  idMiembro: string;
  idUsuario: string;
  nombreUsuario: string;
  emailUsuario: string;
  rol: string;
  fechaUnion: string;
}

/**
 * 🔧 CORREGIDO: Estructura que coincide con el backend
 */
export interface MiembroGrupoDto {
  idMiembro: string;
  idUsuario: string;
  idGrupo: string;
  nombreUsuario: string;  // ✅ CORREGIDO
  emailUsuario: string;   // ✅ CORREGIDO  
  imagenUsuario?: string;
  rol: 'Administrador' | 'Miembro';
  fechaUnion: string;
  estadoMiembro?: 'Activo' | 'Inactivo';  // ✅ OPCIONAL
}

export interface AgregarMiembroDto {
  emailUsuario: string;
  rol?: 'Administrador' | 'Miembro';
}

/**
 * 🔧 NUEVO: Para invitaciones - coincide con backend
 */
export interface InvitacionDto {
  emailInvitado: string;
}