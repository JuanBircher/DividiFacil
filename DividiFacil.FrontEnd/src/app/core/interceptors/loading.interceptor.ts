import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  
  constructor(private loadingService: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // URLs que no deben mostrar loading
    const excludeUrls = [
      '/api/notificaciones/pendientes',
      '/api/auth/me'
    ];

    const shouldShowLoading = !excludeUrls.some(url => req.url.includes(url));

    if (shouldShowLoading) {
      this.loadingService.show();
    }

    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse && shouldShowLoading) {
          // La respuesta ha llegado exitosamente
        }
      }),
      finalize(() => {
        if (shouldShowLoading) {
          this.loadingService.hide();
        }
      })
    );
  }
}