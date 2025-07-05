import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { retry, timer } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 segundo

  return next(req).pipe(
    retry({
      count: maxRetries,
      delay: (error, retryCount) => {
        // Solo reintentar en errores de red (5xx) o timeout
        if (error.status >= 500 || error.status === 0) {
          console.log(`Reintentando petición ${retryCount}/${maxRetries}:`, req.url);
          return timer(retryDelay * retryCount);
        }
        throw error;
      }
    })
  );
};