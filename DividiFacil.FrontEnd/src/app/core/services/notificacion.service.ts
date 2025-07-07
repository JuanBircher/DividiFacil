import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificacionDto } from '../models/notificacion.model';
import { ResponseDto } from '../models/response.model';

export interface ConfiguracionNotificacionesDto {
  idConfiguracion: string;
  idUsuario: string;
  notificarNuevosPagos: boolean;
  notificarNuevosGastos: boolean;
  notificarInvitacionesGrupo: boolean;
  notificarCambiosEstadoPagos: boolean;
  recordatoriosDeudas: boolean;
  recordatoriosPagos: boolean;
  frecuenciaRecordatorios: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = `${environment.apiUrl}/api/notificaciones`;
  private contadorNoLeidasSubject = new BehaviorSubject<number>(0);
  public contadorNoLeidas$ = this.contadorNoLeidasSubject.asObservable();

  constructor(private http: HttpClient) {}

  obtenerPendientes(idUsuario: string): Observable<ResponseDto<NotificacionDto[]>> {
    console.log('[NotificacionService] obtenerPendientes', { idUsuario });
    return this.http.get<ResponseDto<NotificacionDto[]>>(`${this.apiUrl}/pendientes/${idUsuario}`)
      .pipe(
        tap(response => {
          if (response.exito && response.data) {
            const noLeidas = response.data.filter(n => n.estado !== 'Enviado' && n.estado !== 'Leida').length;
            this.contadorNoLeidasSubject.next(noLeidas);
          }
        }),
        catchError(error => {
          console.error('Error al obtener notificaciones pendientes:', error);
          return of({ exito: false, data: undefined, mensaje: 'Error al obtener notificaciones' });
        })
      );
  }

  marcarComoLeida(idNotificacion: string, idUsuario: string): Observable<ResponseDto<void>> {
    console.log('[NotificacionService] marcarComoLeida', { idNotificacion, idUsuario });
    return this.http.put<ResponseDto<void>>(`${this.apiUrl}/${idNotificacion}/marcar-enviada`, { idUsuario });
  }

  obtenerConfiguracion(idUsuario: string): Observable<ResponseDto<ConfiguracionNotificacionesDto>> {
    console.log('[NotificacionService] obtenerConfiguracion', { idUsuario });
    return this.http.get<ResponseDto<ConfiguracionNotificacionesDto>>(`${this.apiUrl}/configuracion/${idUsuario}`);
  }

  actualizarConfiguracion(configuracion: ConfiguracionNotificacionesDto, idUsuarioAdmin: string): Observable<ResponseDto<void>> {
    console.log('[NotificacionService] actualizarConfiguracion', { configuracion, idUsuarioAdmin });
    return this.http.put<ResponseDto<void>>(`${this.apiUrl}/configuracion/${idUsuarioAdmin}`, configuracion);
  }

  obtenerPorGrupo(idGrupo: string, idUsuario: string): Observable<ResponseDto<NotificacionDto[]>> {
    console.log('[NotificacionService] obtenerPorGrupo', { idGrupo, idUsuario });
    return this.http.get<ResponseDto<NotificacionDto[]>>(`${this.apiUrl}/grupo/${idGrupo}?idUsuario=${idUsuario}`);
  }
}