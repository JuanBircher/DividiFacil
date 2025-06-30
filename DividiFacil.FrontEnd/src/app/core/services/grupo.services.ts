import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Grupo } from '../models/grupo.model';

interface ApiResponse<T> {
  exito: boolean;
  data: T;
  // Puedes agregar más campos según tu API (mensaje, etc.)
}

export interface GrupoCreacionDto {
  NombreGrupo: string;
  Descripcion?: string;
  ModoOperacion: string;
}

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private apiUrl = 'http://localhost:62734/api/grupos';

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
}