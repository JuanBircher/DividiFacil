import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/response.model';
import { 
  BalanceGrupoDto, 
  BalanceUsuarioDto, 
  DeudaSimplificadaDto,
  MovimientoDto 
} from '../models/balance.model';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  private readonly apiUrl = `${environment.apiUrl}/api/balance`;

  constructor(private http: HttpClient) {}

  /**
   * Calcular balance completo de un grupo
   */
  calcularBalanceGrupo(idGrupo: string): Observable<ApiResponse<BalanceGrupoDto>> {
    return this.http.get<ApiResponse<BalanceGrupoDto>>(`${this.apiUrl}/grupo/${idGrupo}`);
  }

  /**
   * Obtener balance del usuario en todos sus grupos
   */
  obtenerBalanceUsuario(): Observable<ApiResponse<BalanceUsuarioDto[]>> {
    return this.http.get<ApiResponse<BalanceUsuarioDto[]>>(`${this.apiUrl}/usuario`);
  }

  /**
   * Obtener deudas simplificadas de un grupo
   */
  obtenerDeudasSimplificadas(idGrupo: string): Observable<ApiResponse<DeudaSimplificadaDto[]>> {
    return this.http.get<ApiResponse<DeudaSimplificadaDto[]>>(`${this.apiUrl}/grupo/${idGrupo}/deudas`);
  }

  /**
   * Obtener historial de movimientos de un grupo
   */
  obtenerHistorialMovimientos(idGrupo: string): Observable<ApiResponse<MovimientoDto[]>> {
    return this.http.get<ApiResponse<MovimientoDto[]>>(`${this.apiUrl}/grupo/${idGrupo}/movimientos`);
  }

  /**
   * Obtener resumen de gastos del usuario
   */
  obtenerResumenGastos(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/resumen/gastos`);
  }

  /**
   * Obtener estadísticas de balance por período
   */
  obtenerEstadisticasPeriodo(
    fechaDesde: string, 
    fechaHasta: string,
    idGrupo?: string
  ): Observable<ApiResponse<any>> {
    const url = idGrupo 
      ? `${this.apiUrl}/estadisticas/grupo/${idGrupo}`
      : `${this.apiUrl}/estadisticas/usuario`;
    
    const params = {
      fechaDesde,
      fechaHasta
    };

    return this.http.get<ApiResponse<any>>(url, { params });
  }
}