export interface UsuarioDto {
  idUsuario: string;        // Guid -> string
  nombre: string;           // ✅ Correcto
  email: string;            // ✅ Correcto
  urlImagen?: string; 
  telefono?: string;        // ✅ Correcto
  fechaRegistro: string;    // ✅ Correcto (ISO format)

}

export interface UsuarioRegistroDto {
  nombre: string;
  email: string;
  password: string;
  confirmarPassword: string;
  telefono?: string;
}

export interface UsuarioLoginDto {
  email: string;
  password: string;
}

export interface UsuarioActualizacionDto {
  nombre: string;
  telefono?: string;
  urlImagen?: string;
}

// 🔧 ALIAS para compatibilidad
export interface Usuario extends UsuarioDto {}

// 🔧 AGREGAR: Interfaces para nuevos métodos
export interface CambiarPasswordDto {
  passwordActual: string;
  passwordNuevo: string;
}

export interface EstadisticasUsuarioDto {
  gruposActivos: number;
  gastosRegistrados: number;
  totalGastado: number;
  diasRegistrado: number;
  ultimaActividad: string;
}
