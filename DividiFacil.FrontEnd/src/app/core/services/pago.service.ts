import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseDto } from '../models/response.model';
import { Pago } from '../models/pago.model';

export interface PagoCreacionDto {
  idReceptor: string;
  idGrupo?: string;
  monto: number;
  concepto?: string;
  comprobantePath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private readonly apiUrl = `${environment.apiUrl}/api/pagos`;

  constructor(private http: HttpClient) {}

  // ✅ MÉTODO 1: CrearPagoAsync 
  crearPago(pagoCreacion: PagoCreacionDto): Observable<ResponseDto<Pago>> {
    return this.http.post<ResponseDto<Pago>>(this.apiUrl, pagoCreacion);
  }

  // ✅ MÉTODO 2: GetByIdAsync 
  obtenerPago(idPago: string): Observable<ResponseDto<Pago>> {
    return this.http.get<ResponseDto<Pago>>(`${this.apiUrl}/${idPago}`);
  }

  // ✅ MÉTODO 3: GetByUsuarioAsync 
  obtenerPagosUsuario(idUsuario: string, recibidos: boolean = false): Observable<ResponseDto<Pago[]>> {
    const params = new HttpParams().set('recibidos', recibidos.toString());
    return this.http.get<ResponseDto<Pago[]>>(`${this.apiUrl}/usuario/${idUsuario}`, { params });
  }

  // ✅ MÉTODO 4: GetByGrupoAsync
  obtenerPagosPorGrupo(idGrupo: string): Observable<ResponseDto<Pago[]>> {
    return this.http.get<ResponseDto<Pago[]>>(`${this.apiUrl}/grupo/${idGrupo}`);
  }

  // ✅ MÉTODO 5: ConfirmarPagoAsync 
  confirmarPago(idPago: string): Observable<ResponseDto> {
    return this.http.put<ResponseDto>(`${this.apiUrl}/${idPago}/confirmar`, {});
  }

  // ✅ MÉTODO 6: RechazarPagoAsync 
  rechazarPago(idPago: string, motivo?: string): Observable<ResponseDto> {
    const body = motivo ? { motivo } : {};
    return this.http.put<ResponseDto>(`${this.apiUrl}/${idPago}/rechazar`, body);
  }

  // ✅ MÉTODO 7: DeleteAsync 
  eliminarPago(idPago: string): Observable<ResponseDto> {
    return this.http.delete<ResponseDto>(`${this.apiUrl}/${idPago}`);
  }

  // ✅ MÉTODO 8: GetPagosPendientesAsync 
  obtenerPagosPendientes(): Observable<ResponseDto<Pago[]>> {
    return this.http.get<ResponseDto<Pago[]>>(`${this.apiUrl}/pendientes`);
  }

  // ✅ MÉTODO 9: GetPagosCompletadosAsync 
  obtenerPagosCompletados(): Observable<ResponseDto<Pago[]>> {
    return this.http.get<ResponseDto<Pago[]>>(`${this.apiUrl}/completados`);
  }

  // Métodos auxiliares para mayor claridad
  obtenerPagosEnviados(idUsuario: string): Observable<ResponseDto<Pago[]>> {
    return this.obtenerPagosUsuario(idUsuario, false);
  }

  obtenerPagosRecibidos(idUsuario: string): Observable<ResponseDto<Pago[]>> {
    return this.obtenerPagosUsuario(idUsuario, true);
  }
}