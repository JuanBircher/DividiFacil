import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseDto } from '../models/response.model';
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

  // ✅ MÉTODO 1: CalcularBalanceGrupoAsync
  obtenerBalanceGrupo(idGrupo: string): Observable<ResponseDto<BalanceGrupoDto>> {
    console.log('[BalanceService] obtenerBalanceGrupo', { idGrupo });
    return this.http.get<ResponseDto<BalanceGrupoDto>>(`${this.apiUrl}/grupo/${idGrupo}`);
  }

  // ✅ MÉTODO 2: SimplificarDeudasAsync 
  obtenerDeudasSimplificadas(idGrupo: string): Observable<ResponseDto<DeudaSimplificadaDto[]>> {
    console.log('[BalanceService] obtenerDeudasSimplificadas', { idGrupo });
    return this.http.get<ResponseDto<DeudaSimplificadaDto[]>>(`${this.apiUrl}/grupo/${idGrupo}/simplificado`);
  }

  // ✅ MÉTODO 3: ObtenerBalanceUsuarioAsync
  obtenerBalanceUsuario(): Observable<ResponseDto<BalanceUsuarioDto[]>> {
    console.log('[BalanceService] obtenerBalanceUsuario');
    return this.http.get<ResponseDto<BalanceUsuarioDto[]>>(`${this.apiUrl}/usuario`);
  }

  // ✅ MÉTODO 4: ObtenerHistorialMovimientosAsync 
  obtenerHistorialMovimientos(idGrupo: string): Observable<ResponseDto<MovimientoDto[]>> {
    console.log('[BalanceService] obtenerHistorialMovimientos', { idGrupo });
    return this.http.get<ResponseDto<MovimientoDto[]>>(`${this.apiUrl}/grupo/${idGrupo}/movimientos`);
  }
}