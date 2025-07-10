import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/response.model';

// Interfaces para recordatorios
export interface RecordatorioDto {
  idRecordatorio: string;
  idUsuario: string;
  titulo: string;
  descripcion: string;
  fechaVencimiento: string;
  esRepetitivo: boolean;
  intervaloRepeticion?: 'DIARIO' | 'SEMANAL' | 'MENSUAL';
  completado: boolean;
  fechaCreacion: string;
  fechaCompletado?: string;
}

export interface RecordatorioCreacionDto {
  titulo: string;
  descripcion: string;
  fechaVencimiento: string;
  esRepetitivo: boolean;
  intervaloRepeticion?: 'DIARIO' | 'SEMANAL' | 'MENSUAL';
}

@Injectable({
  providedIn: 'root'
})
export class RecordatorioService {
  private readonly apiUrl = `${environment.apiUrl}/api/recordatorios`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener recordatorios del usuario
   */
  obtenerMisRecordatorios(): Observable<ApiResponse<RecordatorioDto[]>> {
    // console.log('[RecordatorioService] obtenerMisRecordatorios');
    return this.http.get<ApiResponse<RecordatorioDto[]>>(`${this.apiUrl}/usuario`);
  }

  /**
   * Crear nuevo recordatorio
   */
  crearRecordatorio(recordatorio: RecordatorioCreacionDto): Observable<ApiResponse<RecordatorioDto>> {
    // console.log('[RecordatorioService] crearRecordatorio', { recordatorio });
    return this.http.post<ApiResponse<RecordatorioDto>>(this.apiUrl, recordatorio);
  }

  /**
   * Obtener recordatorio por ID
   */
  obtenerRecordatorio(idRecordatorio: string): Observable<ApiResponse<RecordatorioDto>> {
    // console.log('[RecordatorioService] obtenerRecordatorio', { idRecordatorio });
    return this.http.get<ApiResponse<RecordatorioDto>>(`${this.apiUrl}/${idRecordatorio}`);
  }

  /**
   * Actualizar recordatorio
   */
  actualizarRecordatorio(idRecordatorio: string, recordatorio: Partial<RecordatorioCreacionDto>): Observable<ApiResponse<RecordatorioDto>> {
    // console.log('[RecordatorioService] actualizarRecordatorio', { idRecordatorio, recordatorio });
    return this.http.put<ApiResponse<RecordatorioDto>>(`${this.apiUrl}/${idRecordatorio}`, recordatorio);
  }

  /**
   * Marcar recordatorio como completado
   */
  marcarComoCompletado(idRecordatorio: string): Observable<ApiResponse<boolean>> {
    // console.log('[RecordatorioService] marcarComoCompletado', { idRecordatorio });
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${idRecordatorio}/completado`, {});
  }

  /**
   * Eliminar recordatorio
   */
  eliminarRecordatorio(idRecordatorio: string): Observable<ApiResponse<boolean>> {
    // console.log('[RecordatorioService] eliminarRecordatorio', { idRecordatorio });
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${idRecordatorio}`);
  }

  /**
   * Obtener recordatorios pendientes (no completados y no vencidos)
   */
  obtenerPendientes(): Observable<ApiResponse<RecordatorioDto[]>> {
    // console.log('[RecordatorioService] obtenerPendientes');
    return this.http.get<ApiResponse<RecordatorioDto[]>>(`${this.apiUrl}/pendientes`);
  }

  /**
   * Obtener recordatorios vencidos
   */
  obtenerVencidos(): Observable<ApiResponse<RecordatorioDto[]>> {
    // console.log('[RecordatorioService] obtenerVencidos');
    return this.http.get<ApiResponse<RecordatorioDto[]>>(`${this.apiUrl}/vencidos`);
  }

  /**
   * Postponer recordatorio (cambiar fecha de vencimiento)
   */
  postponerRecordatorio(idRecordatorio: string, nuevaFecha: string): Observable<ApiResponse<RecordatorioDto>> {
    // console.log('[RecordatorioService] postponerRecordatorio', { idRecordatorio, nuevaFecha });
    return this.http.put<ApiResponse<RecordatorioDto>>(`${this.apiUrl}/${idRecordatorio}/postponer`, { 
      fechaVencimiento: nuevaFecha 
    });
  }
}