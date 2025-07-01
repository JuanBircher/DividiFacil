import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ha ocurrido un error inesperado';

        // Manejar diferentes tipos de errores
        switch (error.status) {
          case 0:
            errorMessage = 'No se puede conectar con el servidor';
            break;
          case 401:
            errorMessage = 'Sesión expirada';
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            this.router.navigate(['/auth/login']);
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            break;
          case 500:
            errorMessage = 'Error interno del servidor';
            break;
          default:
            errorMessage = error.error?.mensaje || `Error HTTP ${error.status}`;
        }

        // Log simple en consola
        console.error('Error HTTP:', {
          status: error.status,
          message: errorMessage,
          url: req.url
        });

        return throwError(() => ({ status: error.status, message: errorMessage }));
      })
    );
  }
}