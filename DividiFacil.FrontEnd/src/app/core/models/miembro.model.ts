/**
 * 🔧 NUEVO: Modelo que coincide con el backend
 */
export interface MiembroDto {
  idMiembro: string;
  idUsuario: string;
  nombre: string;
  email: string;
  urlImagen?: string;
  rol: string;
  fechaUnion: string;
}