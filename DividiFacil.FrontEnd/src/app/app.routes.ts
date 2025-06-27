import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  // ¡Redirige la ruta raíz si quieres!
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  // Ruta wildcard opcional para errores 404
  { path: '**', redirectTo: 'auth/login' }
];