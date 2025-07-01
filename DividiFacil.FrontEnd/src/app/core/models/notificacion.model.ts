export interface NotificacionDto {
  idNotificacion: string;
  idUsuario: string;
  titulo: string;
  mensaje: string;
  tipo: 'GASTO_CREADO' | 'PAGO_RECIBIDO' | 'PAGO_SOLICITADO' | 'RECORDATORIO' | 'GRUPO_INVITACION';
  fechaCreacion: string;
  leida: boolean;
  enviada: boolean;
  idContexto?: string;
  tipoContexto?: string;
}