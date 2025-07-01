import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
}

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, CacheEntry>();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Solo cachear requests GET
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    // URLs que deben ser cacheadas
    const cacheableUrls = [
      '/api/usuarios/',
      '/api/grupos/',
      '/api/notificaciones/configuracion'
    ];

    const shouldCache = cacheableUrls.some(url => req.url.includes(url));

    if (!shouldCache) {
      return next.handle(req);
    }

    const cachedResponse = this.getFromCache(req.url);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.addToCache(req.url, event);
        }
      })
    );
  }

  private getFromCache(url: string): HttpResponse<any> | null {
    const entry = this.cache.get(url);
    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > environment.cacheTimeout;
    if (isExpired) {
      this.cache.delete(url);
      return null;
    }

    return entry.response;
  }

  private addToCache(url: string, response: HttpResponse<any>): void {
    const entry: CacheEntry = {
      response: response.clone(),
      timestamp: Date.now()
    };
    this.cache.set(url, entry);
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheForUrl(url: string): void {
    this.cache.delete(url);
  }
}