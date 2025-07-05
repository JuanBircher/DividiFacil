import { ErrorHandler, Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  handleError(error: any): void {
    console.error('Global error:', error);

    // Determinar tipo de error
    let message = 'Ha ocurrido un error inesperado';
    let action = 'Cerrar';
    
    if (error.status === 401) {
      message = 'Sesión expirada. Por favor, inicia sesión nuevamente';
      action = 'Ir a Login';
    } else if (error.status === 403) {
      message = 'No tienes permisos para realizar esta acción';
    } else if (error.status === 404) {
      message = 'El recurso solicitado no existe';
    } else if (error.status === 500) {
      message = 'Error del servidor. Por favor, intenta más tarde';
    } else if (error.name === 'ChunkLoadError') {
      message = 'Error de carga. Recargando página...';
      setTimeout(() => window.location.reload(), 2000);
    }

    // Mostrar notificación
    const snackBarRef = this.snackBar.open(message, action, {
      duration: 5000,
      panelClass: ['error-snackbar']
    });

    // Acciones específicas
    if (error.status === 401) {
      snackBarRef.onAction().subscribe(() => {
        this.router.navigate(['/auth/login']);
      });
    }

    // Reportar error (en producción)
    if (environment.production) {
      this.reportError(error);
    }
  }

  private reportError(error: any): void {
    // Implementar servicio de reporting de errores
    // Por ejemplo: Sentry, LogRocket, etc.
    console.log('Reporting error to external service:', error);
  }
}