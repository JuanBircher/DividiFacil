import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';

export const routes: Routes = [
  // Rutas de autenticación con AuthLayout (para usuarios NO logueados)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
        title: 'Iniciar Sesión - DividiFacil'
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        title: 'Crear Cuenta - DividiFacil'
      },
      {
        path: 'recover',
        loadComponent: () =>
          import('./features/auth/recover-password/recover-password.component').then(m => m.RecoverPasswordComponent),
        title: 'Recuperar Contraseña - DividiFacil'
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Rutas principales con MainLayout (para usuarios logueados)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - DividiFacil'
      },
      {
        path: 'grupos',
        loadComponent: () =>
          import('./features/grupos/listado/listado.component').then(m => m.ListadoComponent),
        title: 'Mis Grupos - DividiFacil'
      },
      {
        path: 'grupos/alta',
        loadComponent: () => 
          import('./features/grupos/alta/alta.component').then(m => m.AltaComponent),
        title: 'Crear Grupo - DividiFacil'
      },
      {
        path: 'grupos/detalle/:id',
        loadComponent: () => 
          import('./features/grupos/detalle/detalle.component').then(m => m.DetalleComponent),
        title: 'Detalle del Grupo - DividiFacil'
      },
      // ✅ Aquí puedes agregar más rutas protegidas que ya tengas
      
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Redirección por defecto y manejo de rutas no encontradas
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' }
];