import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/response.model';
import { 
  Pago, 
  PagoCreacionDto, 
  PagoDto 
} from '../models/pago.model';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private readonly apiUrl = `${environment.apiUrl}/api/pagos`;

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo pago
   */
  crearPago(pago: PagoCreacionDto): Observable<ApiResponse<PagoDto>> {
    return this.http.post<ApiResponse<PagoDto>>(this.apiUrl, pago);
  }

  /**
   * Obtener un pago por ID
   */
  obtenerPago(idPago: string): Observable<ApiResponse<PagoDto>> {
    return this.http.get<ApiResponse<PagoDto>>(`${this.apiUrl}/${idPago}`);
  }

  /**
   * Confirmar un pago recibido
   */
  confirmarPago(idPago: string): Observable<ApiResponse<PagoDto>> {
    return this.http.put<ApiResponse<PagoDto>>(`${this.apiUrl}/${idPago}/confirmar`, {});
  }

  /**
   * Rechazar un pago recibido
   */
  rechazarPago(idPago: string, motivo?: string): Observable<ApiResponse<PagoDto>> {
    const body = motivo ? { motivo } : {};
    return this.http.put<ApiResponse<PagoDto>>(`${this.apiUrl}/${idPago}/rechazar`, body);
  }

  /**
   * Obtener pagos de un grupo
   */
  obtenerPagosPorGrupo(
    idGrupo: string,
    filtros?: {
      estado?: 'Pendiente' | 'Completado' | 'Rechazado';
      fechaDesde?: string;
      fechaHasta?: string;
    }
  ): Observable<ApiResponse<PagoDto[]>> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    }

    return this.http.get<ApiResponse<PagoDto[]>>(`${this.apiUrl}/grupo/${idGrupo}`, { params });
  }

  /**
   * Obtener mis pagos (enviados y recibidos)
   */
  obtenerMisPagos(): Observable<ApiResponse<PagoDto[]>> {
    return this.http.get<ApiResponse<PagoDto[]>>(`${this.apiUrl}/usuario`);
  }

  /**
   * Obtener pagos pendientes de confirmación
   */
  obtenerPagosPendientes(): Observable<ApiResponse<PagoDto[]>> {
    return this.http.get<ApiResponse<PagoDto[]>>(`${this.apiUrl}/pendientes`);
  }

  /**
   * Cancelar un pago propio antes de ser confirmado
   */
  cancelarPago(idPago: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${idPago}`);
  }
}