/**
 * 🔧 CORREGIDO: Estructura que coincide EXACTAMENTE con el backend
 */
export interface NotificacionDto {
  idNotificacion: string;
  idUsuario: string;
  idGrupo: string;              // 🔧 AGREGADO: existe en backend
  tipo: string;                 // 🔧 SIMPLIFICADO: usar string como en backend
  mensaje: string;
  estado: string;               // 🔧 AGREGADO: existe en backend
  fechaCreacion: string;
  fechaEnvio?: string;          // 🔧 AGREGADO: existe en backend
  canalEnvio: string;           // 🔧 AGREGADO: existe en backend
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