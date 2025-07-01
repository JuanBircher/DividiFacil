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
   * 🔧 MÉTODO FALTANTE: Obtener pagos realizados por el usuario
   * Backend: GET /api/pagos/realizados
   */
  obtenerPagosRealizados(): Observable<ApiResponse<PagoDto[]>> {
    return this.http.get<ApiResponse<PagoDto[]>>(`${this.apiUrl}/realizados`);
  }

  /**
   * 🔧 MÉTODO FALTANTE: Obtener pagos recibidos por el usuario
   * Backend: GET /api/pagos/recibidos
   */
  obtenerPagosRecibidos(): Observable<ApiResponse<PagoDto[]>> {
    return this.http.get<ApiResponse<PagoDto[]>>(`${this.apiUrl}/recibidos`);
  }

  /**
   * 🔧 MÉTODO FALTANTE: Obtener todos los pagos del usuario (combinado)
   * Combina pagos realizados y recibidos para el dashboard
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

        // Ordenar por fecha más reciente
        const pagosOrdenados = todosPagos
          .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());

        return {
          exito: true,
          mensaje: 'Pagos obtenidos correctamente',
          data: pagosOrdenados
        };
      })
    );
  }

  /**
   * 🔧 MÉTODO FALTANTE: Crear nuevo pago
   * Backend: POST /api/pagos
   */
  crearPago(pago: PagoCreacionDto): Observable<ApiResponse<PagoDto>> {
    return this.http.post<ApiResponse<PagoDto>>(this.apiUrl, pago);
  }

  /**
   * 🔧 MÉTODO FALTANTE: Obtener pago por ID
   * Backend: GET /api/pagos/{id}
   */
  obtenerPagoPorId(idPago: string): Observable<ApiResponse<PagoDto>> {
    return this.http.get<ApiResponse<PagoDto>>(`${this.apiUrl}/${idPago}`);
  }

  /**
   * 🔧 MÉTODO FALTANTE: Confirmar pago
   * Backend: POST /api/pagos/{id}/confirmar
   */
  confirmarPago(idPago: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${idPago}/confirmar`, {});
  }

  /**
   * 🔧 MÉTODO FALTANTE: Rechazar pago
   * Backend: POST /api/pagos/{id}/rechazar
   */
  rechazarPago(idPago: string, motivo?: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${idPago}/rechazar`, { motivo });
  }

  /**
   * 🔧 MÉTODO FALTANTE: Eliminar pago
   * Backend: DELETE /api/pagos/{id}
   */
  eliminarPago(idPago: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${idPago}`);
  }
}