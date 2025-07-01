import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificacionDto } from '../models/notificacion.model';

interface ApiResponse<T> {
  exito: boolean;
  data: T;
  mensaje?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private readonly apiUrl = `${environment.apiUrl}/api/notificaciones`;
  
  // Contador de notificaciones no leídas
  private contadorNoLeidasSubject = new BehaviorSubject<number>(0);
  public contadorNoLeidas$ = this.contadorNoLeidasSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtener notificaciones pendientes del usuario
   */
  obtenerPendientes(): Observable<ApiResponse<NotificacionDto[]>> {
    return this.http.get<ApiResponse<NotificacionDto[]>>(`${this.apiUrl}/pendientes`)
      .pipe(
        tap(response => {
          if (response.exito && response.data) {
            const noLeidas = response.data.filter(n => !n.leida).length;
            this.contadorNoLeidasSubject.next(noLeidas);
          }
        })
      );
  }

  /**
   * Marcar notificación como enviada/leída
   */
  marcarComoLeida(idNotificacion: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${idNotificacion}/enviada`, {});
  }

  /**
   * Obtener contador actual de notificaciones no leídas
   */
  obtenerContadorNoLeidas(): number {
    return this.contadorNoLeidasSubject.value;
  }
}