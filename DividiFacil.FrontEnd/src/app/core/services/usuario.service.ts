import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  UsuarioDto, 
  UsuarioActualizacionDto 
} from '../models/usuario.model';
import { ResponseDto } from '../models/response.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = `${environment.apiUrl}/api/usuarios`;

  constructor(private http: HttpClient) {}

  // ✅ MÉTODO 1: GetByIdAsync - CORREGIDO
  obtenerUsuario(idUsuario: string): Observable<ResponseDto<UsuarioDto>> {
    return this.http.get<ResponseDto<UsuarioDto>>(`${this.apiUrl}/${idUsuario}`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo usuario:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: error.error?.mensaje || 'Error al obtener usuario' 
          });
        })
      );
  }

  // ✅ MÉTODO 2: ActualizarAsync - CORREGIDO
  actualizarUsuario(idUsuario: string, usuario: UsuarioActualizacionDto): Observable<ResponseDto<void>> {
    return this.http.put<ResponseDto<void>>(`${this.apiUrl}/${idUsuario}`, usuario)
      .pipe(
        catchError(error => {
          console.error('Error actualizando usuario:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: error.error?.mensaje || 'Error al actualizar usuario' 
          });
        })
      );
  }

  // ✅ MÉTODO 3: BuscarPorEmailAsync - CORREGIDO
  buscarPorEmail(email: string): Observable<ResponseDto<UsuarioDto>> {
    return this.http.get<ResponseDto<UsuarioDto>>(`${this.apiUrl}/buscar/${encodeURIComponent(email)}`)
      .pipe(
        catchError(error => {
          console.error('Error buscando usuario:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: error.error?.mensaje || 'Usuario no encontrado' 
          });
        })
      );
  }

  // ✅ MÉTODO 4: SubirImagenAsync - CORREGIDO
  subirImagen(idUsuario: string, archivo: File): Observable<ResponseDto<{ urlImagen: string }>> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    
    return this.http.post<ResponseDto<{ urlImagen: string }>>(
      `${this.apiUrl}/${idUsuario}/imagen`, 
      formData
    ).pipe(
      catchError(error => {
        console.error('Error subiendo imagen:', error);
        return of({ 
          exito: false, 
          data: undefined, 
          mensaje: error.error?.mensaje || 'Error al subir imagen' 
        });
      })
    );
  }

  // ✅ MÉTODO 5: CambiarPasswordAsync - NUEVO
  cambiarPassword(idUsuario: string, passwordActual: string, passwordNuevo: string): Observable<ResponseDto<void>> {
    const datos = {
      passwordActual,
      passwordNuevo
    };
    
    return this.http.put<ResponseDto<void>>(`${this.apiUrl}/${idUsuario}/password`, datos)
      .pipe(
        catchError(error => {
          console.error('Error cambiando password:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: error.error?.mensaje || 'Error al cambiar contraseña' 
          });
        })
      );
  }

  // ✅ MÉTODO 6: DesactivarCuentaAsync - NUEVO
  desactivarCuenta(idUsuario: string): Observable<ResponseDto<void>> {
    return this.http.delete<ResponseDto<void>>(`${this.apiUrl}/${idUsuario}`)
      .pipe(
        catchError(error => {
          console.error('Error desactivando cuenta:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: error.error?.mensaje || 'Error al desactivar cuenta' 
          });
        })
      );
  }

  // ✅ MÉTODO 7: GetEstadisticasAsync - NUEVO
  obtenerEstadisticas(idUsuario: string): Observable<ResponseDto<any>> {
    return this.http.get<ResponseDto<any>>(`${this.apiUrl}/${idUsuario}/estadisticas`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo estadísticas:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: error.error?.mensaje || 'Error al obtener estadísticas' 
          });
        })
      );
  }

  // ✅ MÉTODO AUXILIAR: Para mantener compatibilidad
  obtenerUsuarioActual(): Observable<ResponseDto<UsuarioDto>> {
    return this.http.get<ResponseDto<UsuarioDto>>(`${this.apiUrl}/actual`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo usuario actual:', error);
          return of({ 
            exito: false, 
            data: undefined, 
            mensaje: error.error?.mensaje || 'Error al obtener usuario actual' 
          });
        })
      );
  }
}