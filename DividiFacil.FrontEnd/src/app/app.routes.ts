import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { tokenGuard } from './core/guards/token.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';

export const routes: Routes = [
  // Rutas de autenticación
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
      {
        path: 'recover',
        loadComponent: () =>
          import('./features/auth/recover-password/recover-password.component').then(m => m.RecoverPasswordComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Rutas protegidas
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard, tokenGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'grupos',
        loadComponent: () =>
          import('./features/grupos/listado/listado.component').then(m => m.ListadoComponent),
      },
      {
        path: 'grupos/alta',
        loadComponent: () => 
          import('./features/grupos/alta/alta.component').then(m => m.AltaComponent),
      },
      {
        path: 'grupos/detalle/:id',
        loadComponent: () => 
          import('./features/grupos/detalle/detalle.component').then(m => m.DetalleComponent),
      },
      {
        path: 'gastos',
        loadComponent: () =>
          import('./features/gastos/listado/listado.component').then(m => m.ListadoComponent),
      },
      {
        path: 'gastos/alta',
        loadComponent: () =>
          import('./features/gastos/alta/alta.component').then(m => m.AltaComponent),
      },
      {
        path: 'pagos',
        loadComponent: () =>
          import('./features/pagos/listado/listado.component').then(m => m.ListadoComponent),
      },
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./features/notificaciones/listado/listado.component').then(m => m.ListadoComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' }
];