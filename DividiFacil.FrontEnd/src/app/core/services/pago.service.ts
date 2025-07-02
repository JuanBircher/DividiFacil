import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
   * Obtener pagos realizados por el usuario
   */
  obtenerPagosRealizados(): Observable<ApiResponse<PagoDto[]>> {
    return this.http.get<ApiResponse<PagoDto[]>>(`${this.apiUrl}/realizados`);
  }

  /**
   * Obtener pagos recibidos por el usuario
   */
  obtenerPagosRecibidos(): Observable<ApiResponse<PagoDto[]>> {
    return this.http.get<ApiResponse<PagoDto[]>>(`${this.apiUrl}/recibidos`);
  }

  /**
   * 🔧 MÉTODO PARA DASHBOARD: Combinar pagos realizados y recibidos
   */
  obtenerMisPagos(): Observable<ApiResponse<PagoDto[]>> {
    return forkJoin({
      realizados: this.obtenerPagosRealizados(),
      recibidos: this.obtenerPagosRecibidos()
    }).pipe(
      map(({ realizados, recibidos }) => {
        const todosPagos = [
          ...(realizados.data || []),
          ...(recibidos.data || [])
        ];
        
        return {
          exito: true,
          data: todosPagos.sort((a, b) => 
            new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
          )
        } as ApiResponse<PagoDto[]>;
      })
    );
  }

  /**
   * 🔧 MÉTODO FALTANTE: Obtener pagos por grupo
   */
  obtenerPagosPorGrupo(idGrupo: string): Observable<ApiResponse<PagoDto[]>> {
    return this.http.get<ApiResponse<PagoDto[]>>(`${this.apiUrl}/grupo/${idGrupo}`);
  }

  /**
   * Obtener pago por ID
   */
  obtenerPago(idPago: string): Observable<ApiResponse<PagoDto>> {
    return this.http.get<ApiResponse<PagoDto>>(`${this.apiUrl}/${idPago}`);
  }

  /**
   * Crear nuevo pago
   */
  crearPago(pago: PagoCreacionDto): Observable<ApiResponse<PagoDto>> {
    return this.http.post<ApiResponse<PagoDto>>(this.apiUrl, pago);
  }

  /**
   * Confirmar pago recibido
   */
  confirmarPago(idPago: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${idPago}/confirmar`, {});
  }

  /**
   * Rechazar pago
   */
  rechazarPago(idPago: string, motivo?: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${idPago}/rechazar`, { motivo });
  }

  /**
   * Eliminar pago
   */
  eliminarPago(idPago: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${idPago}`);
  }

  /**
   * ✅ NUEVO: Obtener todos los pagos con filtros
   */
  obtenerPagos(filtros?: any): Observable<ApiResponse<PagoDto[]>> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.idGrupo) params = params.set('idGrupo', filtros.idGrupo);
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    }
    
    return this.http.get<ApiResponse<PagoDto[]>>(`${this.apiUrl}`, { params });
  }
}