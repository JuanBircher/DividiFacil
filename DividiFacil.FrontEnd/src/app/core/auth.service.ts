import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoginRequest } from './models/login-request.model';
import { LoginResponse } from './models/login-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

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

  private handleError(error: HttpErrorResponse) {
    // Ajusta según la estructura de error del back
    let mensaje = 'Error desconocido.';
    if (error.error && error.error.Mensaje) {
      mensaje = error.error.Mensaje;
    }
    return throwError(() => new Error(mensaje));
  }
}