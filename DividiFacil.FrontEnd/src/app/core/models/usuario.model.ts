export interface Usuario {
  idUsuario: string;
  nombre: string;
  email: string;
  telefono?: string;
  urlImagen?: string;
  fechaCreacion: string;
  estaActivo: boolean;
}

// DTO para creación de usuario
export interface UsuarioCreacionDto {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
}

// DTO para actualización de usuario
export interface UsuarioActualizacionDto {
  nombre: string;
  telefono?: string;
  urlImagen?: string;
}