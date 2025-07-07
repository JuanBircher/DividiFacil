import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { refreshTokenInterceptor } from './app/core/interceptors/refresh-token.interceptor';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

console.log('Iniciando bootstrap de Angular...');

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, refreshTokenInterceptor])),
  ]
})
  .then(() => console.log('Bootstrap completado'))
  .catch((err) => console.error(err));