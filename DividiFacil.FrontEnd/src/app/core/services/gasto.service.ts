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
   * 🔧 MÉTODO FALTANTE: Obtener gastos recientes del usuario
   * Backend: GET /api/gastos/recientes?cantidad=10
   */
  obtenerMisGastos(): Observable<ApiResponse<GastoDto[]>> {
    return this.http.get<ApiResponse<GastoDto[]>>(`${this.apiUrl}/recientes?cantidad=10`);
  }

  /**
   * 🔧 MÉTODO FALTANTE: Obtener gastos por grupo
   * Backend: GET /api/gastos/grupo/{idGrupo}
   */
  obtenerGastosPorGrupo(idGrupo: string): Observable<ApiResponse<GastoDto[]>> {
    return this.http.get<ApiResponse<GastoDto[]>>(`${this.apiUrl}/grupo/${idGrupo}`);
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
}