import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/auth.guard';

// ===================== CHECKLIST DE RUTAS PRINCIPALES =====================
// GRUPOS:
//  - /grupos                -> Listado de grupos
//  - /grupos/alta           -> Alta de grupo
//  - /grupos/unirse         -> Unirse a grupo por código
//  - /grupos/:idGrupo       -> Detalle de grupo
//  - /grupos/:idGrupo/editar-> Editar grupo
//  - /grupos/:idGrupo/configuraciones -> Configuración de grupo
// GASTOS:
//  - /gastos                -> Listado de gastos
//  - /gastos/alta           -> Alta de gasto
//  - /gastos/:idGasto       -> Detalle de gasto
//  - /gastos/:idGasto/editar-> Editar gasto
// PAGOS:
//  - /pagos                 -> Listado de pagos
//  - /pagos/alta            -> Alta de pago
//  - /pagos/:idPago         -> Detalle de pago
// BALANCES:
//  - /balances/grupo/:idGrupo -> Balance de grupo
//  - /balances/usuario        -> Balance de usuario
// OTROS:
//  - /notificaciones, /caja, /perfil, /test-*
// RUTA POR DEFECTO:
//  - '**' -> Redirige a login
// ===========================================================================

export const routes: Routes = [
  // ✅ RUTAS DE AUTENTICACIÓN
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // ✅ RUTAS PRINCIPALES CON LAYOUT
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // ✅ DASHBOARD
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // ✅ GRUPOS - RUTAS COMPLETAS Y CONSISTENTES
      {
        path: 'grupos',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/grupos/listado-grupos/listado-grupos.component').then(m => m.ListadoGruposComponent)
          },
          {
            path: 'alta',
            loadComponent: () => import('./features/grupos/alta-grupos/alta-grupos.component').then(m => m.AltaGruposComponent)
          },
          {
            path: 'unirse',
            loadComponent: () => import('./features/grupos/unirse-codigo/unirse-codigo.component').then(m => m.UnirseCodigoComponent)
          },
          {
            path: ':idGrupo', // ✅ CONSISTENTE CON BACKEND
            loadComponent: () => import('./features/grupos/detalle-grupos/detalle-grupos.component').then(m => m.DetalleGruposComponent)
          },
          {
            path: ':idGrupo/editar',
            loadComponent: () => import('./features/grupos/alta-grupos/alta-grupos.component').then(m => m.AltaGruposComponent)
          },
          {
            path: ':idGrupo/configuraciones',
            loadComponent: () => import('./features/grupos/configuraciones/configuraciones.component').then(m => m.ConfiguracionesComponent)
          }
        ]
      },

      // ✅ GASTOS - RUTAS CONSISTENTES
      {
        path: 'gastos',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/gastos/listado/listado.component').then(m => m.ListadoGastosComponent)
          },
          {
            path: 'alta',
            loadComponent: () => import('./features/gastos/alta/alta.component').then(m => m.AltaGastosComponent)
          },
          {
            path: ':idGasto', 
            loadComponent: () => import('./features/gastos/detalle/detalle-gasto.component').then(m => m.DetalleGastoComponent)
          },
          {
            path: ':idGasto/editar',
            loadComponent: () => import('./features/gastos/alta/alta.component').then(m => m.AltaGastosComponent)
          }
        ]
      },

      // ✅ PAGOS - RUTAS CONSISTENTES
      {
        path: 'pagos',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/pagos/listado-pagos/listado-pagos.component').then(m => m.ListadoPagosComponent)
          },
          {
            path: 'alta',
            loadComponent: () => import('./features/pagos/alta-pagos/alta-pagos.component').then(m => m.AltaPagosComponent)
          },
          {
            path: ':idPago', // ✅ CONSISTENTE CON BACKEND
            loadComponent: () => import('./features/pagos/detalle-pagos/detalle-pagos.component').then(m => m.DetallePagosComponent)
          }
        ]
      },

      // ✅ BALANCES - RUTAS CONSISTENTES
      {
        path: 'balances',
        children: [
          {
            path: '',
            redirectTo: 'usuario',
            pathMatch: 'full'
          },
          {
            path: 'grupo/:idGrupo',
            loadComponent: () => import('./features/balances/balance-grupo/balance-grupo.component').then(m => m.BalanceGrupoComponent)
          },
          {
            path: 'usuario',
            loadComponent: () => import('./features/balances/balance-usuario/balance-usuario.component').then(m => m.BalanceUsuarioComponent)
          }
        ]
      },

      // ✅ OTRAS RUTAS
      {
        path: 'notificaciones',
        loadComponent: () => import('./features/notificaciones/listado/listado.component').then(m => m.ListadoNotificacionesComponent)
      },
      {
        path: 'caja',
        loadComponent: () => import('./features/caja/caja/caja.component').then(m => m.CajaComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/perfil/perfil/perfil.component').then(m => m.PerfilComponent)
      },
      {
        path: 'test-auth',
        loadComponent: () => import('./features/test/auth-test.component').then(m => m.AuthTestComponent)
      },
      {
        path: 'test-grupos',
        loadComponent: () => import('./features/test/grupos-test.component').then(m => m.GruposTestComponent)
      },
      {
        path: 'test-dashboard',
        loadComponent: () => import('./features/test/dashboard-test.component').then(m => m.DashboardTestComponent)
      },
      {
        path: 'test-gastos',
        loadComponent: () => import('./features/test/gastos-test.component').then(m => m.GastosTestComponent)
      }
    ]
  },

  // ✅ RUTA POR DEFECTO
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];