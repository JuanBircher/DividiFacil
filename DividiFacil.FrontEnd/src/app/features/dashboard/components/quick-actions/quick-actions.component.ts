import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CardComponent } from '../../../../shared/components/card/card.component';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: 'primary' | 'accent' | 'warn' | 'success' | 'info';
  route?: string;
  action?: () => void;
  disabled?: boolean;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    CardComponent
  ]
})
export class QuickActionsComponent {
  
  actions: QuickAction[] = [
    {
      id: 'create-group',
      title: 'Crear Grupo',
      description: 'Inicia un nuevo grupo para dividir gastos',
      icon: 'group_add',
      color: 'primary',
      route: '/grupos/alta'  // ✅ CORRECTA - esta ruta SÍ existe
    },
    {
      id: 'add-expense',
      title: 'Registrar Gasto',
      description: 'Añade un nuevo gasto a un grupo',
      icon: 'receipt_long',
      color: 'accent',
      route: '/gastos/alta'  // ✅ CORRECTA - esta ruta SÍ existe
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Ver alertas y pendientes',
      icon: 'notifications',
      color: 'warn',
      route: '/notificaciones'  // ✅ CORRECTA
    },
    {
      id: 'my-groups',
      title: 'Mis Grupos',
      description: 'Ver todos mis grupos activos',
      icon: 'groups',
      color: 'info',
      route: '/grupos'  // ✅ CORRECTA
    },
    {
      id: 'payments',
      title: 'Pagos',
      description: 'Gestionar pagos y balances',
      icon: 'payment',
      color: 'success',
      route: '/listado-pagos'  // ✅ CORRECTA
    },
    {
      id: 'caja-comun',
      title: 'Caja Común',
      description: 'Gestionar fondos compartidos',
      icon: 'account_balance',
      color: 'info',
      route: '/caja'  // ✅ NUEVA - esta ruta SÍ existe
    },
    {
      id: 'profile',
      title: 'Mi Perfil',
      description: 'Configurar cuenta y preferencias',
      icon: 'account_circle',
      color: 'primary',
      route: '/perfil'  // ✅ CORRECTA
    }
  ];

  constructor(public router: Router) {}

  /**
   * 🎓 EXPLICACIÓN: Ejecuta la acción correspondiente
   * Puede navegar a una ruta o ejecutar una función personalizada
   */
  ejecutarAccion(action: QuickAction): void {
    if (action.disabled) {
      return;
    }

    if (action.route) {
      this.router.navigate([action.route]);
    } else if (action.action) {
      action.action();
    }
  }

  /**
   * 🎓 EXPLICACIÓN: Método para deshabilitar acciones según lógica de negocio
   */
  isActionDisabled(action: QuickAction): boolean {
    // Aquí puedes agregar lógica para deshabilitar acciones
    // Por ejemplo, si el usuario no tiene permisos
    return action.disabled || false;
  }
}