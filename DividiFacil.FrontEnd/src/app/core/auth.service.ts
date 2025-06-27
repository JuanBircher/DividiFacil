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

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginRequest).pipe(
      map(response => {
        // Puedes guardar el token aquí si quieres
        localStorage.setItem('token', response.token);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  logout() {
    localStorage.removeItem('token');
    // Puedes limpiar otros datos aquí
  }

  register(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/registro`, registerRequest).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let mensaje = 'Error desconocido.';
    if (error.error && typeof error.error === 'string') {
      // Si el error es un string plano
      mensaje = error.error;
    } else if (error.error && error.error.mensaje) {
      // Si tu backend responde { mensaje: "..." }
      mensaje = error.error.mensaje;
    }
    return throwError(() => new Error(mensaje));
  }
}