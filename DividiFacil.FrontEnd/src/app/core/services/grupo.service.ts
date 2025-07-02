import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/response.model';
import { 
  Grupo, 
  GrupoConMiembrosDto, 
  MiembroGrupoSimpleDto 
} from '../models/grupo.model';
import { GastoDto } from '../models/gasto.model';

export interface GrupoCreacionDto {
  nombreGrupo: string;
  descripcion?: string;
  modoOperacion: string;
}

export interface InvitacionDto {
  emailUsuario: string;
  rol?: string;
}

export interface CodigoAccesoDto {
  codigo: string;
  fechaExpiracion: string;
}

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private readonly apiUrl = `${environment.apiUrl}/api/grupos`;

  constructor(private http: HttpClient) {}

  // ✅ MÉTODOS EXISTENTES CORREGIDOS
  getGrupos(): Observable<ApiResponse<Grupo[]>> {
    return this.http.get<ApiResponse<Grupo[]>>(this.apiUrl);
  }

  getGrupo(idGrupo: string): Observable<ApiResponse<Grupo>> {
    return this.http.get<ApiResponse<Grupo>>(`${this.apiUrl}/${idGrupo}`);
  }

  // 🔧 MÉTODO CRÍTICO: Obtener grupo con miembros
  obtenerMiembros(idGrupo: string): Observable<ApiResponse<GrupoConMiembrosDto>> {
    return this.http.get<ApiResponse<GrupoConMiembrosDto>>(`${this.apiUrl}/${idGrupo}/miembros`);
  }

  // 🔧 CORREGIR: Método generarCodigoAcceso (el backend devuelve string, no objeto)
  generarCodigoAcceso(idGrupo: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/${idGrupo}/codigo-acceso`, {});
  }

  // 🔧 MÉTODO YA EXISTENTE: buscarPorCodigo 
  buscarPorCodigo(codigo: string): Observable<ApiResponse<Grupo>> {
    return this.http.get<ApiResponse<Grupo>>(`${this.apiUrl}/codigo/${codigo}`);
  }

  crearGrupo(grupo: GrupoCreacionDto): Observable<ApiResponse<Grupo>> {
    return this.http.post<ApiResponse<Grupo>>(this.apiUrl, grupo);
  }

  actualizarGrupo(idGrupo: string, grupo: GrupoCreacionDto): Observable<ApiResponse<Grupo>> {
    return this.http.put<ApiResponse<Grupo>>(`${this.apiUrl}/${idGrupo}`, grupo);
  }

  eliminarGrupo(idGrupo: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${idGrupo}`);
  }

  // 🔧 MÉTODOS PARA GESTIÓN DE MIEMBROS
  agregarMiembro(idGrupo: string, invitacion: InvitacionDto): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${idGrupo}/miembros`, invitacion);
  }

  eliminarMiembro(idGrupo: string, idMiembro: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${idGrupo}/miembros/${idMiembro}`);
  }

  cambiarRolMiembro(idGrupo: string, idMiembro: string, nuevoRol: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${idGrupo}/miembros/${idMiembro}/rol`, {
      nuevoRol: nuevoRol
    });
  }

  obtenerGastosPorGrupo(idGrupo: string): Observable<ApiResponse<GastoDto[]>> {
    return this.http.get<ApiResponse<GastoDto[]>>(`${this.apiUrl}/grupo/${idGrupo}`);
  }
}