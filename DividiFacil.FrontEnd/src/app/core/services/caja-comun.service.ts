import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseDto } from '../models/response.model';
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
  crearCajaComun(idGrupo: string, idUsuarioAdmin: string): Observable<ResponseDto<CajaComunDto>> {
    // console.log('[CajaComunService] crearCajaComun', { idGrupo, idUsuarioAdmin });
    return this.http.post<ResponseDto<CajaComunDto>>(
      `${this.apiUrl}/grupo/${idGrupo}/crear`, 
      { idUsuarioAdmin }
    );
  }

  /**
   * Obtener caja común de un grupo
   */
  obtenerCajaPorGrupo(idGrupo: string, idUsuarioSolicitante: string): Observable<ResponseDto<CajaComunDto>> {
    // console.log('[CajaComunService] obtenerCajaPorGrupo', { idGrupo, idUsuarioSolicitante });
    return this.http.get<ResponseDto<CajaComunDto>>(
      `${this.apiUrl}/grupo/${idGrupo}?idUsuarioSolicitante=${idUsuarioSolicitante}`
    );
  }

  /**
   * Registrar movimiento en caja común
   */
  registrarMovimiento(movimiento: MovimientoCajaCreacionDto, idUsuarioCreador: string): Observable<ResponseDto<MovimientoCajaDto>> {
    // console.log('[CajaComunService] registrarMovimiento', { movimiento, idUsuarioCreador });
    return this.http.post<ResponseDto<MovimientoCajaDto>>(
      `${this.apiUrl}/movimientos`, 
      { ...movimiento, idUsuarioCreador }
    );
  }

  /**
   * Obtener movimientos de una caja común
   */
  obtenerMovimientos(idCaja: string, idUsuarioSolicitante: string): Observable<ResponseDto<MovimientoCajaDto[]>> {
    // console.log('[CajaComunService] obtenerMovimientos', { idCaja, idUsuarioSolicitante });
    return this.http.get<ResponseDto<MovimientoCajaDto[]>>(
      `${this.apiUrl}/${idCaja}/movimientos?idUsuarioSolicitante=${idUsuarioSolicitante}`
    );
  }

  /**
   * Eliminar movimiento de caja común
   */
  eliminarMovimiento(idMovimiento: string, idUsuarioSolicitante: string): Observable<ResponseDto<void>> {
    // console.log('[CajaComunService] eliminarMovimiento', { idMovimiento, idUsuarioSolicitante });
    return this.http.delete<ResponseDto<void>>(
      `${this.apiUrl}/movimientos/${idMovimiento}?idUsuarioSolicitante=${idUsuarioSolicitante}`
    );
  }

  /**
   * 🔐 VALIDAR PERMISOS
   */
  validarPermisos(idCaja: string) {
    console.log('[CajaComunService] validarPermisos', { idCaja });
    // Implementa la llamada HTTP real aquí según tu backend
    // Ejemplo usando HttpClient:
    return this.http.get<{ exito: boolean, data: any }>(`/api/caja/${idCaja}/permisos`);
  }
}