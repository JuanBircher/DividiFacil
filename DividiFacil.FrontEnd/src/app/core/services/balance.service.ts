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
   * ✅ CORREGIDO: Obtener balance completo de un grupo
   */
  obtenerBalanceGrupo(idGrupo: string): Observable<ApiResponse<BalanceGrupoDto>> {
    return this.http.get<ApiResponse<BalanceGrupoDto>>(`${this.apiUrl}/grupo/${idGrupo}`);
  }

  /**
   * ✅ CORREGIDO: Obtener balance del usuario en todos sus grupos
   */
  obtenerBalanceUsuario(): Observable<ApiResponse<BalanceUsuarioDto[]>> {
    return this.http.get<ApiResponse<BalanceUsuarioDto[]>>(`${this.apiUrl}/usuario`);
  }

  /**
   * ✅ CORREGIDO: Obtener deudas simplificadas de un grupo
   */
  obtenerDeudasSimplificadas(idGrupo: string): Observable<ApiResponse<DeudaSimplificadaDto[]>> {
    return this.http.get<ApiResponse<DeudaSimplificadaDto[]>>(`${this.apiUrl}/grupo/${idGrupo}/simplificado`);
  }

  /**
   * ✅ CORREGIDO: Obtener historial de movimientos de un grupo
   */
  obtenerHistorialMovimientos(idGrupo: string): Observable<ApiResponse<MovimientoDto[]>> {
    return this.http.get<ApiResponse<MovimientoDto[]>>(`${this.apiUrl}/grupo/${idGrupo}/movimientos`);
  }
}