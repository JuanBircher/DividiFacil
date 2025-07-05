// 🔧 MODELO TOTALMENTE ALINEADO CON BACKEND

// ✅ DTO PRINCIPAL - EXACTAMENTE IGUAL AL BACKEND
export interface GrupoDto {
  idGrupo: string;              // Guid -> string
  nombreGrupo: string;          // ✅ Correcto
  descripcion?: string;         // ✅ Correcto
  modoOperacion: string;        // ✅ Correcto (Backend usa "Estandar")
  idUsuarioCreador: string;     // Guid -> string
  nombreCreador: string;        // ✅ Correcto
  fechaCreacion: string;        // DateTime -> string (ISO format)
  codigoAcceso?: string;        // ✅ Correcto
  cantidadMiembros: number;     // ✅ Correcto
  totalGastos: number;          // decimal -> number
}

// 🔧 AGREGAR: Interface Grupo (alias para retrocompatibilidad)
export interface Grupo extends GrupoDto {}

// 🔧 AGREGAR: Interfaces de miembros faltantes
export interface MiembroDto {
  idMiembro: string;            // Guid -> string
  idUsuario: string;            // Guid -> string
  nombre: string;               // ✅ Correcto
  email: string;                // ✅ Correcto
  urlImagen?: string;           // 🔧 CAMBIAR: de imagenUsuario a urlImagen
  rol: string;                  // ✅ Correcto
  fechaUnion: string;           // DateTime -> string (ISO format)
}

export interface MiembroGrupoSimpleDto {
  idMiembro: string;            // Guid -> string
  idUsuario: string;            // Guid -> string
  nombreUsuario: string;        // ✅ Correcto
  emailUsuario: string;         // ✅ Correcto
  rol: string;                  // ✅ Correcto
  fechaUnion: string;           // DateTime -> string (ISO format)
}

export interface MiembroGrupoDto extends MiembroDto {}

export interface GrupoConMiembrosDto extends GrupoDto {
  miembros: MiembroGrupoSimpleDto[];
}

// ✅ DTO PARA CREAR GRUPOS - EXACTAMENTE IGUAL AL BACKEND
export interface GrupoCreacionDto {
  nombreGrupo: string;          // Backend: string NombreGrupo
  descripcion?: string;         // Backend: string? Descripcion
  modoOperacion: string;        // Default "Estandar"
}

// ✅ DTO PARA INVITACIONES - EXACTAMENTE IGUAL AL BACKEND
export interface InvitacionDto {
  emailInvitado: string;        // 🔧 CAMBIAR: de email a emailInvitado
  // 🔧 ELIMINAR: mensaje (no existe en backend)
}

// ✅ AGREGAR: Interface para cambio de rol
export interface CambioRolDto {
  nuevoRol: string;
}

// ✅ ENUMS PARA CONSISTENCIA
export enum ModoOperacion {
  ESTANDAR = 'Estandar',        // Backend: "Estandar"
  EQUITATIVO = 'Equitativo',    // Backend: "Equitativo"
  PROPORCIONAL = 'Proporcional' // Backend: "Proporcional"
}

export enum RolMiembro {
  ADMIN = 'Admin',              // Backend: "Admin"
  MIEMBRO = 'Miembro'           // Backend: "Miembro"
}