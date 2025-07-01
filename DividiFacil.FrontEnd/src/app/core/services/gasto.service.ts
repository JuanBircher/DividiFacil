import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/response.model';
import { 
  Gasto, 
  GastoCreacionDto, 
  GastoDto 
} from '../models/gasto.model';

@Injectable({
  providedIn: 'root'
})
export class GastoService {
  private readonly apiUrl = `${environment.apiUrl}/api/gastos`;

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo gasto
   */
  crearGasto(gasto: GastoCreacionDto): Observable<ApiResponse<GastoDto>> {
    return this.http.post<ApiResponse<GastoDto>>(this.apiUrl, gasto);
  }

  /**
   * Obtener un gasto por ID
   */
  obtenerGasto(idGasto: string): Observable<ApiResponse<GastoDto>> {
    return this.http.get<ApiResponse<GastoDto>>(`${this.apiUrl}/${idGasto}`);
  }

  /**
   * Actualizar un gasto existente
   */
  actualizarGasto(idGasto: string, gasto: Partial<GastoCreacionDto>): Observable<ApiResponse<GastoDto>> {
    return this.http.put<ApiResponse<GastoDto>>(`${this.apiUrl}/${idGasto}`, gasto);
  }

  /**
   * Eliminar un gasto
   */
  eliminarGasto(idGasto: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${idGasto}`);
  }

  /**
   * Obtener gastos de un grupo con filtros opcionales
   */
  obtenerGastosPorGrupo(
    idGrupo: string, 
    filtros?: {
      fechaDesde?: string;
      fechaHasta?: string;
      montoMinimo?: number;
      montoMaximo?: number;
    }
  ): Observable<ApiResponse<GastoDto[]>> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
      if (filtros.montoMinimo) params = params.set('montoMinimo', filtros.montoMinimo.toString());
      if (filtros.montoMaximo) params = params.set('montoMaximo', filtros.montoMaximo.toString());
    }

    return this.http.get<ApiResponse<GastoDto[]>>(`${this.apiUrl}/grupo/${idGrupo}`, { params });
  }

  /**
   * Obtener gastos del usuario actual
   */
  obtenerMisGastos(): Observable<ApiResponse<GastoDto[]>> {
    return this.http.get<ApiResponse<GastoDto[]>>(`${this.apiUrl}/usuario`);
  }

  /**
   * Marcar detalle de gasto como pagado
   */
  marcarComoPagado(idDetalleGasto: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/detalle/${idDetalleGasto}/pagar`, {});
  }

  /**
   * Obtener gastos pendientes de pago para el usuario
   */
  obtenerGastosPendientes(): Observable<ApiResponse<GastoDto[]>> {
    return this.http.get<ApiResponse<GastoDto[]>>(`${this.apiUrl}/pendientes`);
  }
}