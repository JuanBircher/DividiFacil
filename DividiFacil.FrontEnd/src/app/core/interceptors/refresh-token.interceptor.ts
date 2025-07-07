import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es 401 y no es la petición de refresh ni de login
      if (
        error.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/refresh')
      ) {
        // Intenta refrescar el token
        return authService.refreshToken().pipe(
          switchMap((response) => {
            if (response.exito && response.data?.token) {
              // Clona la petición original con el nuevo token
              const newReq = req.clone({
                setHeaders: { Authorization: `Bearer ${response.data.token}` }
              });
              return next(newReq);
            } else {
              authService.logout();
              return throwError(() => error);
            }
          }),
          catchError(err => {
            authService.logout();
            return throwError(() => err);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
