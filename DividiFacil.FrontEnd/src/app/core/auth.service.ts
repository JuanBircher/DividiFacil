import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Usuario, UsuarioLoginDto, UsuarioRegistroDto } from './models/usuario.model';
import { ApiResponse } from './models/response.model';
import { Router } from '@angular/router';

interface LoginResponseDto {
  token: string;
  expiracion: string;
  refreshToken: string;
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;
  private usuarioActualSubject = new BehaviorSubject<Usuario | null>(null);
  
  public usuarioActual$ = this.usuarioActualSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('AuthService inicializado');
    this.inicializarUsuario();
  }

  private inicializarUsuario(): void {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        this.usuarioActualSubject.next(usuario);
      } catch (error) {
        console.error('Error al parsear usuario guardado:', error);
        this.limpiarSesion();
      }
    }
  }

  login(credenciales: UsuarioLoginDto): Observable<ApiResponse<LoginResponseDto>> {
    return this.http.post<ApiResponse<LoginResponseDto>>(`${this.apiUrl}/login`, credenciales)
      .pipe(
        tap(response => {
          console.log('[AuthService] Respuesta login:', response);
          const exito = response.exito;
          const data = response.data;
          if (exito && data) {
            this.guardarSesion(data);
          }
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => error);
        })
      );
  }

  register(registro: UsuarioRegistroDto): Observable<ApiResponse<LoginResponseDto>> {
    return this.http.post<ApiResponse<LoginResponseDto>>(`${this.apiUrl}/registro`, registro)
      .pipe(
        tap(response => {
          const exito = response.exito;
          const data = response.data;
          if (exito && data) {
            this.guardarSesion(data);
          }
        }),
        catchError(error => {
          console.error('Error en registro:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): Observable<any> {
    const token = this.obtenerToken();
    return this.http.post(`${this.apiUrl}/logout`, { token })
      .pipe(
        tap(() => this.limpiarSesion()),
        catchError(error => {
          this.limpiarSesion();
          return throwError(() => error);
        })
      );
  }

  refreshToken(): Observable<ApiResponse<LoginResponseDto>> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<ApiResponse<LoginResponseDto>>(`${this.apiUrl}/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          const exito = response.exito;
          const data = response.data;
          if (exito && data) {
            this.guardarSesion(data);
          }
        }),
        catchError(error => {
          this.limpiarSesion();
          return throwError(() => error);
        })
      );
  }

  private guardarSesion(data: LoginResponseDto): void {
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    // Guardar idUsuario y nombreUsuario por compatibilidad con el layout
    if (data.usuario?.idUsuario) {
      localStorage.setItem('idUsuario', data.usuario.idUsuario);
    }
    if (data.usuario?.nombre) {
      localStorage.setItem('nombreUsuario', data.usuario.nombre);
    }
    this.usuarioActualSubject.next(data.usuario);
  }

  private limpiarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('nombreUsuario');
    this.usuarioActualSubject.next(null);
  }

  estaLogueado(): boolean {
    return !!this.obtenerToken() && !this.tokenExpirado();
  }

  tokenExpirado(): boolean {
    const token = this.obtenerToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp < now;
    } catch (error) {
      return true;
    }
  }

  obtenerUsuario(): Usuario | null {
    return this.usuarioActualSubject.value;
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  obtenerRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}