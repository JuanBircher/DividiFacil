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

  // ✅ MÉTODO 1: CalcularBalanceGrupoAsync - ALINEADO CON BACKEND
  obtenerBalanceGrupo(idGrupo: string): Observable<ResponseDto<BalanceGrupoDto>> {
    console.log('[BalanceService] obtenerBalanceGrupo', { idGrupo });
    return this.http.get<ResponseDto<BalanceGrupoDto>>(`${this.apiUrl}/grupo/${idGrupo}`);
  }

  // ✅ MÉTODO 2: SimplificarDeudasAsync - ALINEADO CON BACKEND
  obtenerDeudasSimplificadas(idGrupo: string): Observable<ResponseDto<DeudaSimplificadaDto[]>> {
    console.log('[BalanceService] obtenerDeudasSimplificadas', { idGrupo });
    return this.http.get<ResponseDto<DeudaSimplificadaDto[]>>(`${this.apiUrl}/grupo/${idGrupo}/simplificado`);
  }

  // ✅ MÉTODO 3: ObtenerBalanceUsuarioAsync - ALINEADO CON BACKEND
  obtenerBalanceUsuario(idUsuario: string): Observable<ResponseDto<BalanceUsuarioDto[]>> {
    console.log('[BalanceService] obtenerBalanceUsuario', { idUsuario });
    return this.http.get<ResponseDto<BalanceUsuarioDto[]>>(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  // ✅ MÉTODO 4: ObtenerHistorialMovimientosAsync - ALINEADO CON BACKEND
  obtenerHistorialMovimientos(idGrupo: string): Observable<ResponseDto<MovimientoDto[]>> {
    console.log('[BalanceService] obtenerHistorialMovimientos', { idGrupo });
    return this.http.get<ResponseDto<MovimientoDto[]>>(`${this.apiUrl}/grupo/${idGrupo}/movimientos`);
  }
}