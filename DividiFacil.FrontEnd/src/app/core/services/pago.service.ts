import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/response.model';
import { PagoDto, PagoCreacionDto } from '../models/pago.model';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private readonly apiUrl = `${environment.apiUrl}/api/pagos`;

  constructor(private http: HttpClient) {}

  /**
   * 🚨 MÉTODO CRÍTICO FALTANTE para dashboard
   * Backend: GET /api/pagos/realizados
   */
  obtenerPagosRealizados(): Observable<ApiResponse<PagoDto[]>> {
    return this.http.get<ApiResponse<PagoDto[]>>(`${this.apiUrl}/realizados`);
  }

  /**
   * 🚨 MÉTODO CRÍTICO FALTANTE para dashboard
   * Backend: GET /api/pagos/recibidos
   */
  obtenerPagosRecibidos(): Observable<ApiResponse<PagoDto[]>> {
    return this.http.get<ApiResponse<PagoDto[]>>(`${this.apiUrl}/recibidos`);
  }

  /**
   * 🚨 MÉTODO CRÍTICO FALTANTE para recent-activity
   * Combina pagos realizados y recibidos
   */
  obtenerMisPagos(): Observable<ApiResponse<PagoDto[]>> {
    return forkJoin({
      realizados: this.obtenerPagosRealizados(),
      recibidos: this.obtenerPagosRecibidos()
    }).pipe(
      map(responses => {
        const todosPagos: PagoDto[] = [];
        
        if (responses.realizados.exito && responses.realizados.data) {
          todosPagos.push(...responses.realizados.data);
        }
        
        if (responses.recibidos.exito && responses.recibidos.data) {
          todosPagos.push(...responses.recibidos.data);
        }

        return {
          exito: true,
          mensaje: 'Pagos obtenidos correctamente',
          data: todosPagos
        };
      })
    );
  }

  /**
   * 🔧 NUEVO: Obtener pago por ID
   * Backend: GET /api/pagos/{id}
   */
  obtenerPagoPorId(idPago: string): Observable<ApiResponse<PagoDto>> {
    return this.http.get<ApiResponse<PagoDto>>(`${this.apiUrl}/${idPago}`);
  }

  /**
   * 🔧 NUEVO: Crear pago
   * Backend: POST /api/pagos
   */
  crearPago(pago: PagoCreacionDto): Observable<ApiResponse<PagoDto>> {
    return this.http.post<ApiResponse<PagoDto>>(this.apiUrl, pago);
  }

  /**
   * 🔧 NUEVO: Confirmar pago
   * Backend: POST /api/pagos/{id}/confirmar
   */
  confirmarPago(idPago: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${idPago}/confirmar`, {});
  }

  /**
   * 🔧 NUEVO: Rechazar pago
   * Backend: POST /api/pagos/{id}/rechazar
   */
  rechazarPago(idPago: string, motivo?: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${idPago}/rechazar`, { motivo });
  }

  /**
   * 🔧 NUEVO: Eliminar pago
   * Backend: DELETE /api/pagos/{id}
   */
  eliminarPago(idPago: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${idPago}`);
  }

  /**
   * 🔧 NUEVO: Obtener pagos por grupo
   * Backend: GET /api/pagos/grupo/{idGrupo}
   */
  obtenerPagosPorGrupo(idGrupo: string): Observable<ApiResponse<PagoDto[]>> {
    return this.http.get<ApiResponse<PagoDto[]>>(`${this.apiUrl}/grupo/${idGrupo}`);
  }
}