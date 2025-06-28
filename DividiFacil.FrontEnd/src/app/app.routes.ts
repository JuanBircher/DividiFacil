import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

// ⚠️ Importación directa para MainLayoutComponent, necesario para rutas hijas protegidas
import { MainLayoutComponent } from '../../src/app/layout/main-layout/main-layout.component';

export const routes: Routes = [
  // Rutas de autenticación (no usan layout general)
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'auth/recover',
    loadComponent: () =>
      import('./features/auth/recover-password/recover-password.component').then(m => m.RecoverPasswordComponent),
  },

  // Rutas protegidas, bajo layout general (navbar/sidebar)
  {
    path: '',
    canActivate: [authGuard],
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      // {
      //   path: 'grupos',
      //   loadComponent: () =>
      //     import('./features/grupos/grupos.component').then(m => m.GruposComponent),
      // },
      // {
      //   path: 'gastos',
      //   loadComponent: () =>
      //     import('./features/gastos/gastos.component').then(m => m.GastosComponent),
      // },
      // {
      //   path: 'pagos',
      //   loadComponent: () =>
      //     import('./features/pagos/pagos.component').then(m => m.PagosComponent),
      // },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'auth/login' }
];