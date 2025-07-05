export interface MiembroGrupoDto {
  idMiembro: string;                    // Guid -> string
  idUsuario: string;                    // Guid -> string
  idGrupo: string;                      // Guid -> string
  nombre: string;                       // ✅ Correcto
  email: string;                        // ✅ Correcto
  urlImagen?: string;                   // ✅ Correcto
  rol: string;                          // ✅ Correcto
  fechaUnion: string;                   // DateTime -> string (ISO format)
}