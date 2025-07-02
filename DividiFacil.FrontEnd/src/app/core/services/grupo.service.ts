import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Grupo, GrupoCreacionDto, GrupoConMiembrosDto, MiembroGrupoDto, AgregarMiembroDto } from '../models/grupo.model';

interface ApiResponse<T> {
  exito: boolean;
  data: T;
  mensaje?: string;
}

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private readonly apiUrl = `${environment.apiUrl}/api/grupos`;

  constructor(private http: HttpClient) {}

  getGrupos(): Observable<ApiResponse<Grupo[]>> {
    return this.http.get<ApiResponse<Grupo[]>>(this.apiUrl);
  }

  getGrupo(idGrupo: string): Observable<ApiResponse<Grupo>> {
    return this.http.get<ApiResponse<Grupo>>(`${this.apiUrl}/${idGrupo}`);
  }

  crearGrupo(grupo: GrupoCreacionDto): Observable<ApiResponse<Grupo>> {
    return this.http.post<ApiResponse<Grupo>>(this.apiUrl, grupo);
  }

  actualizarGrupo(idGrupo: string, grupo: Partial<Grupo>): Observable<ApiResponse<Grupo>> {
    return this.http.put<ApiResponse<Grupo>>(`${this.apiUrl}/${idGrupo}`, grupo);
  }

  eliminarGrupo(idGrupo: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${idGrupo}`);
  }

  obtenerGruposPorUsuario(): Observable<ApiResponse<GrupoConMiembrosDto[]>> {
    return this.http.get<ApiResponse<GrupoConMiembrosDto[]>>(`${this.apiUrl}/usuario`);
  }

  buscarPorCodigo(codigoAcceso: string): Observable<ApiResponse<Grupo>> {
    return this.http.get<ApiResponse<Grupo>>(`${this.apiUrl}/codigo/${codigoAcceso}`);
  }

  unirseAGrupo(codigoAcceso: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/unirse`, { codigoAcceso });
  }

  obtenerMiembros(idGrupo: string): Observable<ApiResponse<MiembroGrupoDto[]>> {
    return this.http.get<ApiResponse<MiembroGrupoDto[]>>(`${this.apiUrl}/${idGrupo}/miembros`);
  }

  agregarMiembro(idGrupo: string, miembro: AgregarMiembroDto): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/${idGrupo}/miembros`, miembro);
  }

  eliminarMiembro(idGrupo: string, idMiembro: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${idGrupo}/miembros/${idMiembro}`);
  }

  cambiarRolMiembro(idGrupo: string, idMiembro: string, nuevoRol: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${idGrupo}/miembros/${idMiembro}/rol`, { 
      rol: nuevoRol 
    });
  }

  /**
   * Genera un código de acceso para un grupo específico.
   * Backend: POST /api/grupos/{id}/codigo-acceso
   */
  generarCodigoAcceso(idGrupo: string): Observable<ApiResponse<{ codigo: string }>> {
    return this.http.post<ApiResponse<{ codigo: string }>>(`${this.apiUrl}/${idGrupo}/codigo-acceso`, {});
  }
}