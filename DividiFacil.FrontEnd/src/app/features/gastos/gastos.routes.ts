import { Routes } from '@angular/router';

export const gastosRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./listado/listado.component').then(c => c.ListadoComponent)
  },
  {
    path: 'alta',
    loadComponent: () => import('./alta/alta.component').then(c => c.AltaComponent)
  },
  {
    path: 'detalle/:id',
    loadComponent: () => import('./detalle/detalle-gasto.component').then(c => c.DetalleGastoComponent)
  }
];