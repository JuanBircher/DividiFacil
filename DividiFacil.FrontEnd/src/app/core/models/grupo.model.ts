export interface Grupo {
  idGrupo: string;
  nombreGrupo: string;
  descripcion?: string;
  fechaCreacion: string;
  codigoAcceso: string;      
  modoOperacion: string;     
  idUsuarioCreacion: string;
}

// ✅ MANTENER DTOs existentes
export interface GrupoCreacionDto {
  nombreGrupo: string;
  descripcion?: string;
  modoOperacion: string;
}

export interface GrupoConMiembrosDto {
  idGrupo: string;
  nombreGrupo: string;
  descripcion?: string;
  fechaCreacion: string;
  codigoAcceso: string;
  modoOperacion: string;
  miembros: MiembroGrupoDto[];
  totalGastos: number;
  totalMiembros: number;
}

export interface MiembroGrupoDto {
  idMiembro: string;
  idUsuario: string;
  idGrupo: string;
  nombreUsuario: string;
  emailUsuario: string;
  imagenUsuario?: string;
  rol: 'Administrador' | 'Miembro';
  fechaUnion: string;
  estadoMiembro: 'Activo' | 'Inactivo';
}

export interface AgregarMiembroDto {
  emailUsuario: string;
  rol: 'Administrador' | 'Miembro';
}