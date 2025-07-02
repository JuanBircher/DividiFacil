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
   * 🚨 MÉTODO CRÍTICO FALTANTE para el dashboard
   * Backend: GET /api/gastos/recientes?cantidad=10
   */
  obtenerMisGastos(): Observable<ApiResponse<GastoDto[]>> {
    return this.http.get<ApiResponse<GastoDto[]>>(`${this.apiUrl}/recientes?cantidad=10`);
  }

  /**
   * 🔧 NUEVO: Obtener saldos del usuario
   * Backend: GET /api/gastos/mis-saldos
   */
  obtenerMisSaldos(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/mis-saldos`);
  }

  /**
   * 🔧 NUEVO: Obtener saldos de grupo
   * Backend: GET /api/gastos/grupo/{idGrupo}/saldos
   */
  obtenerSaldosGrupo(idGrupo: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/grupo/${idGrupo}/saldos`);
  }

  /**
   * 🔧 NUEVO: Marcar detalle como pagado
   * Backend: POST /api/gastos/{idGasto}/detalle/{idDetalle}/marcar-pagado
   */
  marcarComoPagado(idGasto: string, idDetalle: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${idGasto}/detalle/${idDetalle}/marcar-pagado`, {});
  }

  /**
   * 🔧 NUEVO: Obtener gastos paginados por grupo
   * Backend: GET /api/gastos/grupo/{idGrupo}/paginado
   */
  obtenerGastosPaginados(idGrupo: string, paginacion: any): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('pagina', paginacion.pagina?.toString() || '1')
      .set('tamano', paginacion.tamano?.toString() || '10');
      
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/grupo/${idGrupo}/paginado`, { params });
  }

  /**
   * 🔧 MÉTODO FALTANTE: Aprobar gasto
   * Backend: POST /api/gastos/{id}/aprobar
   */
  aprobarGasto(idGasto: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${idGasto}/aprobar`, {});
  }

  /**
   * 🔧 MÉTODO FALTANTE: Rechazar gasto
   * Backend: POST /api/gastos/{id}/rechazar
   */
  rechazarGasto(idGasto: string, motivo?: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${idGasto}/rechazar`, { motivo });
  }

  /**
   * 🔧 MÉTODO FALTANTE: Eliminar gasto
   * Backend: DELETE /api/gastos/{id}
   */
  eliminarGasto(idGasto: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${idGasto}`);
  }

  /**
   * 🔧 MÉTODO FALTANTE: Obtener gastos por grupo
   */
  obtenerGastosPorGrupo(idGrupo: string): Observable<ApiResponse<GastoDto[]>> {
    return this.http.get<ApiResponse<GastoDto[]>>(`${this.apiUrl}/grupo/${idGrupo}`);
  }
}