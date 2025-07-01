import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Usuario, UsuarioCreacionDto } from './models/usuario.model';

interface ApiResponse<T> {
  exito: boolean;
  data: T;
  mensaje?: string;
}

interface LoginDto {
  email: string;
  password: string;
}

interface UsuarioLogueadoDto {
  usuario: Usuario;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;
  
  private usuarioActualSubject = new BehaviorSubject<Usuario | null>(null);
  public usuarioActual$ = this.usuarioActualSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarUsuarioDesdeStorage();
  }

  login(loginData: LoginDto): Observable<ApiResponse<UsuarioLogueadoDto>> {
    return this.http.post<ApiResponse<UsuarioLogueadoDto>>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          if (response.exito && response.data) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
            this.usuarioActualSubject.next(response.data.usuario);
          }
        })
      );
  }

  register(registerData: UsuarioCreacionDto): Observable<ApiResponse<UsuarioLogueadoDto>> {
    return this.http.post<ApiResponse<UsuarioLogueadoDto>>(`${this.apiUrl}/register`, registerData)
      .pipe(
        tap(response => {
          if (response.exito && response.data) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
            this.usuarioActualSubject.next(response.data.usuario);
          }
        })
      );
  }

  logout(): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => {
          this.limpiarSesion();
        })
      );
  }

  obtenerUsuarioActual(): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/usuario-actual`)
      .pipe(
        tap(response => {
          if (response.exito && response.data) {
            localStorage.setItem('usuario', JSON.stringify(response.data));
            this.usuarioActualSubject.next(response.data);
          }
        })
      );
  }

  estaLogueado(): boolean {
    return !!localStorage.getItem('token');
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  obtenerUsuario(): Usuario | null {
    return this.usuarioActualSubject.value;
  }

  private cargarUsuarioDesdeStorage(): void {
    const usuarioJson = localStorage.getItem('usuario');
    if (usuarioJson) {
      try {
        const usuario = JSON.parse(usuarioJson);
        this.usuarioActualSubject.next(usuario);
      } catch (error) {
        console.error('Error al parsear usuario desde localStorage:', error);
        this.limpiarSesion();
      }
    }
  }

  private limpiarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuarioActualSubject.next(null);
  }
}