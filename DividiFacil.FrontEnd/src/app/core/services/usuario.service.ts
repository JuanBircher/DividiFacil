import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, UsuarioActualizacionDto } from '../models/usuario.model';

interface ApiResponse<T> {
  exito: boolean;
  data: T;
  mensaje?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = `${environment.apiUrl}/api/usuarios`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener información de un usuario por ID
   */
  obtenerUsuario(idUsuario: string): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/${idUsuario}`);
  }

  /**
   * Actualizar información del usuario
   */
  actualizarUsuario(idUsuario: string, usuario: UsuarioActualizacionDto): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.apiUrl}/${idUsuario}`, usuario);
  }

  /**
   * Buscar usuario por email
   */
  buscarPorEmail(email: string): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/buscar/${encodeURIComponent(email)}`);
  }

  /**
   * Subir imagen de perfil
   */
  subirImagen(idUsuario: string, archivo: File): Observable<ApiResponse<{ urlImagen: string }>> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    
    return this.http.post<ApiResponse<{ urlImagen: string }>>(
      `${this.apiUrl}/${idUsuario}/imagen`, 
      formData
    );
  }
}