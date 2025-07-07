import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { CardComponent } from '../../../../shared/components/card/card.component';

// ✅ INTERFACE CORREGIDA
interface QuickAction {
  id: string;
  titulo: string;        // ✅ Consistente con template
  descripcion: string;
  icono: string;
  ruta?: string;         // ✅ Consistente con template
  color: string;
  deshabilitado?: boolean;
  accion?: () => void;
  badge?: number;
  destacado?: boolean;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CardComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    RouterModule
  ]
})
export class QuickActionsComponent implements OnInit, OnDestroy {
  // ✅ CAMBIAR NOMBRE PARA CONSISTENCIA
  actions: QuickAction[] = [];
  loading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    public router: Router, // ✅ HACER PÚBLICO PARA TEMPLATE
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.inicializarAcciones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🚀 INICIALIZAR ACCIONES RÁPIDAS
   */
  private inicializarAcciones(): void {
    this.actions = [
      {
        id: 'crear-grupo',
        titulo: 'Crear Grupo',
        descripcion: 'Inicia un nuevo grupo para dividir gastos',
        icono: 'group_add',
        color: 'primary',
        ruta: '/grupos/alta',
        destacado: true
      },
      {
        id: 'registrar-gasto',
        titulo: 'Registrar Gasto',
        descripcion: 'Agrega un nuevo gasto a tus grupos',
        icono: 'add_shopping_cart',
        color: 'accent',
        ruta: '/gastos/alta',
        destacado: false
      },
      {
        id: 'realizar-pago',
        titulo: 'Realizar Pago',
        descripcion: 'Salda tus cuentas pendientes',
        icono: 'payment',
        color: 'warn',
        ruta: '/pagos/alta',
        destacado: false
      },
      {
        id: 'unirse-grupo',
        titulo: 'Unirse a Grupo',
        descripcion: 'Únete a un grupo usando un código',
        icono: 'group',
        color: 'primary',
        ruta: '/grupos/unirse',
        destacado: false
      },
      {
        id: 'ver-balance',
        titulo: 'Ver Balance',
        descripcion: 'Revisa tu balance general',
        icono: 'account_balance',
        color: 'accent',
        ruta: '/balances/usuario',
        destacado: false
      },
      {
        id: 'notificaciones',
        titulo: 'Notificaciones',
        descripcion: 'Revisa tus notificaciones',
        icono: 'notifications',
        color: 'warn',
        ruta: '/notificaciones',
        destacado: false,
        badge: 0 // ✅ Por ahora 0, luego implementar servicio
      }
    ];
  }

  /**
   * 🔗 EJECUTAR ACCIÓN
   */
  ejecutarAccion(action: QuickAction): void {
    console.log('🚀 Ejecutando acción:', action.titulo);
    
    if (action.ruta) {
      this.router.navigate([action.ruta]);
    } else if (action.accion) {
      action.accion();
    }
  }

  /**
   * 🎯 TRACKING FUNCTION
   */
  trackByActionId = (index: number, action: QuickAction): string => action.id;
}