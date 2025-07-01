import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/response.model';
import { 
  CajaComunDto, 
  MovimientoCajaDto, 
  MovimientoCajaCreacionDto 
} from '../models/caja-comun.model';

@Injectable({
  providedIn: 'root'
})
export class CajaComunService {
  private readonly apiUrl = `${environment.apiUrl}/api/caja-comun`;

  constructor(private http: HttpClient) {}

  /**
   * Crear caja común para un grupo
   */
  crearCajaComun(idGrupo: string, datosCaja: { nombreCaja: string, descripcion?: string }): Observable<ApiResponse<CajaComunDto>> {
    return this.http.post<ApiResponse<CajaComunDto>>(`${this.apiUrl}/grupo/${idGrupo}`, datosCaja);
  }

  /**
   * Obtener caja común de un grupo
   */
  obtenerCajaPorGrupo(idGrupo: string): Observable<ApiResponse<CajaComunDto>> {
    return this.http.get<ApiResponse<CajaComunDto>>(`${this.apiUrl}/grupo/${idGrupo}`);
  }

  /**
   * Actualizar información de la caja común
   */
  actualizarCaja(idCaja: string, datos: Partial<CajaComunDto>): Observable<ApiResponse<CajaComunDto>> {
    return this.http.put<ApiResponse<CajaComunDto>>(`${this.apiUrl}/${idCaja}`, datos);
  }

  /**
   * Registrar movimiento en caja común
   */
  registrarMovimiento(movimiento: MovimientoCajaCreacionDto): Observable<ApiResponse<MovimientoCajaDto>> {
    return this.http.post<ApiResponse<MovimientoCajaDto>>(`${this.apiUrl}/movimientos`, movimiento);
  }

  /**
   * Obtener movimientos de una caja común
   */
  obtenerMovimientos(
    idCaja: string,
    filtros?: {
      tipoMovimiento?: 'INGRESO' | 'EGRESO';
      fechaDesde?: string;
      fechaHasta?: string;
      pagina?: number;
      tamaño?: number;
    }
  ): Observable<ApiResponse<MovimientoCajaDto[]>> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.tipoMovimiento) params = params.set('tipo', filtros.tipoMovimiento);
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
      if (filtros.pagina) params = params.set('pagina', filtros.pagina.toString());
      if (filtros.tamaño) params = params.set('tamaño', filtros.tamaño.toString());
    }

    return this.http.get<ApiResponse<MovimientoCajaDto[]>>(`${this.apiUrl}/${idCaja}/movimientos`, { params });
  }

  /**
   * Eliminar movimiento de caja común
   */
  eliminarMovimiento(idMovimiento: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/movimientos/${idMovimiento}`);
  }

  /**
   * Obtener resumen de la caja común
   */
  obtenerResumen(idCaja: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${idCaja}/resumen`);
  }

  /**
   * Obtener estadísticas de movimientos por período
   */
  obtenerEstadisticas(
    idCaja: string, 
    fechaDesde: string, 
    fechaHasta: string
  ): Observable<ApiResponse<any>> {
    const params = {
      fechaDesde,
      fechaHasta
    };

    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${idCaja}/estadisticas`, { params });
  }

  /**
   * Validar si el usuario puede realizar operaciones en la caja
   */
  validarPermisos(idCaja: string): Observable<ApiResponse<{ puedeIngresar: boolean, puedeRetirar: boolean }>> {
    return this.http.get<ApiResponse<{ puedeIngresar: boolean, puedeRetirar: boolean }>>(`${this.apiUrl}/${idCaja}/permisos`);
  }
}