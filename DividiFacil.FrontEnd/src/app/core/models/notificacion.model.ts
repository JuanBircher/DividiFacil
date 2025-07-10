
export interface NotificacionDto {
  idNotificacion: string;               
  idUsuario: string;                    
  idGrupo: string;                      
  tipo: string;                        
  mensaje: string;                      
  estado: string;                      
  fechaCreacion: string;                
  fechaEnvio?: string;                  
  canalEnvio: string;                  
  nombreUsuario?: string;               
  nombreGrupo?: string;                
}


export interface NotificacionFrontendDto {
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