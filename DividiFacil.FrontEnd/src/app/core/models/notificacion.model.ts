/**
 * 🔧 CORREGIDO: Estructura que coincide EXACTAMENTE con el backend
 */
export interface NotificacionDto {
  idNotificacion: string;               // Guid -> string
  idUsuario: string;                    // Guid -> string
  idGrupo: string;                      // Nuevo campo: ID del grupo
  tipo: string;                         // ✅ Correcto
  mensaje: string;                      // ✅ Correcto
  estado: string;                       // Nuevo campo: Estado de la notificación
  fechaCreacion: string;                // DateTime -> string (ISO format)
  fechaEnvio?: string;                  // DateTime -> string (ISO format), opcional
  canalEnvio: string;                  // Nuevo campo: Canal de envío
  nombreUsuario?: string;               // Opcional para mostrar el nombre del usuario
  nombreGrupo?: string;                 // Opcional para mostrar el nombre del grupo
}

/**
 * 🔧 NUEVO: Para compatibilidad con frontend existente
 * Mapear desde NotificacionDto cuando sea necesario
 */
export interface NotificacionFrontendDto {
  idNotificacion: string;
  idUsuario: string;
  titulo: string;               // Calculado desde tipo + mensaje
  mensaje: string;
  tipo: 'GASTO_CREADO' | 'PAGO_RECIBIDO' | 'PAGO_SOLICITADO' | 'RECORDATORIO' | 'GRUPO_INVITACION';
  fechaCreacion: string;
  leida: boolean;               // Calculado desde estado
  enviada: boolean;             // Calculado desde fechaEnvio
  idContexto?: string;          // Opcional para funcionalidad frontend
  tipoContexto?: string;        // Opcional para funcionalidad frontend
}