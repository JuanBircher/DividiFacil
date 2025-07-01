export interface Usuario {
  idUsuario: string;
  nombre: string;
  email: string;
  telefono?: string;
  urlImagen?: string;
  fechaRegistro: string;  // ✅ CORREGIDO: era fechaCreacion
  activo: boolean;        // ✅ CORREGIDO: era estaActivo
}

// DTO para creación de usuario
export interface UsuarioCreacionDto {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
}

// DTO para registro (con confirmación)
export interface UsuarioRegistroDto {
  nombre: string;
  email: string;
  password: string;
  confirmarPassword: string;
  telefono?: string;
}

// DTO para actualización de usuario
export interface UsuarioActualizacionDto {
  nombre: string;
  telefono?: string;
  urlImagen?: string;
}

/**
 * 🔧 NUEVO: DTO que coincide exactamente con el backend
 */
export interface UsuarioDto {
  idUsuario: string;
  nombre: string;
  email: string;
  urlImagen?: string;
  telefono?: string;
  fechaRegistro: string;
}