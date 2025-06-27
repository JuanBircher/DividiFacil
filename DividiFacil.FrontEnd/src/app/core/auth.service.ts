import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoginRequest } from './models/login-request.model';
import { LoginResponse } from './models/login-response.model';
import { RegisterResponse } from './models/register-response.model';
import { RegisterRequest } from './models/register-request.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:62734/api/auth';

  constructor(private http: HttpClient) { }

  login(loginRequest: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        map(response => {
          if (response.exito && response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('nombreUsuario', response.nombre || '');
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

   logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('nombreUsuario');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  register(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/registro`, registerRequest).pipe(
      catchError(this.handleError)
    );
  }

   private handleError(error: HttpErrorResponse) {
    let mensaje = 'Error desconocido.';
    if (error.error && typeof error.error === 'string') {
      mensaje = error.error;
    } else if (error.error && error.error.mensaje) {
      mensaje = error.error.mensaje;
    }
    return throwError(() => new Error(mensaje));
  }
}