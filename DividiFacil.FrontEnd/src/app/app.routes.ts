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
          import('./features/grupos/listado-grupos/listado-grupos.component').then(m => m.ListadoComponent),
      },
      {
        path: 'grupos/alta',
        loadComponent: () => 
          import('./features/grupos/alta-grupos/alta-grupos.component').then(m => m.AltaGruposComponent),
      },
      {
        path: 'grupos/detalle/:id',
        loadComponent: () => 
          import('./features/grupos/detalle-grupos/detalle-grupos.component').then(m => m.DetalleGruposComponent),
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
        path: 'gastos/editar/:id',
        loadComponent: () =>
          import('./features/gastos/alta/alta.component').then(m => m.AltaComponent),
      },
      {
        path: 'gastos/detalle/:id',
        loadComponent: () => 
          import('./features/gastos/detalle/detalle-gasto.component').then(m => m.DetalleGastoComponent),
      },
      {
        path: 'listado-pagos',
        loadComponent: () =>
          import('./features/pagos/listado-pagos/listado-pagos.component').then(m => m.ListadoPagosComponent),
      },
      {
        path: 'alta-pagos',
        loadComponent: () => 
          import('./features/pagos/alta-pagos/alta-pagos.component').then(m => m.AltaPagosComponent),
      },
      {
        path: 'detalle-pagos/:id',
        loadComponent: () => 
          import('./features/pagos/detalle-pagos/detalle-pagos.component').then(m => m.DetallePagosComponent),
      },
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./features/notificaciones/listado/listado.component').then(m => m.ListadoComponent),
      },
      {
        path: 'caja',
        loadComponent: () =>
          import('./features/caja/caja/caja.component').then(m => m.CajaComponent),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/perfil/perfil/perfil.component').then(m => m.PerfilComponent),
      },
      {
        path: 'perfil/editar',
        loadComponent: () =>
          import('./features/perfil/editar/editar.component').then(m => m.EditarComponent),
      },
      // BALANCES - DENTRO DEL LAYOUT PROTEGIDO
      {
        path: 'balances',
        children: [
          {
            path: '',
            redirectTo: 'grupo',
            pathMatch: 'full'
          },
          {
            path: 'grupo/:id',
            loadComponent: () => import('./features/balances/balance-grupo/balance-grupo.component').then(m => m.BalanceGrupoComponent),
          },
          {
            path: 'usuario/:id',
            loadComponent: () => import('./features/balances/balance-usuario/balance-usuario.component').then(m => m.BalanceUsuarioComponent),
          }
        ]
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' }
];