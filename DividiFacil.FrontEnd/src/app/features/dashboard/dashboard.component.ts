import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule, Router } from '@angular/router';

// Importar componentes hijo
import { DashboardStatsComponent } from './components/dashboard-stats/dashboard-stats.component';
import { RecentGroupsComponent } from './components/recent-groups/recent-groups.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';
import { RecentActivityComponent } from './components/recent-activity/recent-activity.component';

import { AuthService } from '../../core/auth.service';
import { Subject } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    RouterModule,
    DashboardStatsComponent,
    QuickActionsComponent,
    RecentActivityComponent,
    MatProgressSpinnerModule
  ]
})

export class DashboardComponent implements OnInit, OnDestroy {
  nombreUsuario: string = 'Usuario';
  saludoPersonalizado: string = '';
  horaActual: string = '';
  idUsuario: string = '';
  fabLoading = false;

  private intervalId?: number;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.configurarSaludo();
    this.actualizarHora();

    // ✅ ACTUALIZAR HORA CADA MINUTO
    this.intervalId = window.setInterval(() => {
      this.actualizarHora();
    }, 60000);

  }

  /**
   * Maneja el click del FAB con feedback visual y protección de doble click
   */
  onFabClick(): void {
    if (this.fabLoading) return;
    this.fabLoading = true;
    this.cdr.markForCheck();
    this.router.navigate(['/gastos/alta']).then(() => {
      setTimeout(() => {
        this.fabLoading = false;
        this.cdr.markForCheck();
      }, 800); // Breve delay para UX
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 👤 CARGAR DATOS DEL USUARIO
   */
  private cargarDatosUsuario(): void {
    const usuario = this.authService.obtenerUsuario();
    if (usuario?.nombre) {
      this.nombreUsuario = usuario.nombre;
      this.idUsuario = usuario.idUsuario;
    } else {
      // Fallback: extraer del token
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.nombreUsuario = payload.nombre || payload.sub || 'Usuario';
        } catch (error) {
          console.warn('No se pudo extraer nombre del token');
        }
      }
    }
    this.cdr.markForCheck();
  }

  /**
   * 🌅 CONFIGURAR SALUDO PERSONALIZADO
   */
  private configurarSaludo(): void {
    const hora = new Date().getHours();
    
    if (hora < 12) {
      this.saludoPersonalizado = '¡Buenos días';
    } else if (hora < 18) {
      this.saludoPersonalizado = '¡Buenas tardes';
    } else {
      this.saludoPersonalizado = '¡Buenas noches';
    }
    
    this.cdr.markForCheck();
  }

  /**
   * 🕐 ACTUALIZAR HORA ACTUAL
   */
  private actualizarHora(): void {
    const ahora = new Date();
    this.horaActual = ahora.toLocaleString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    this.cdr.markForCheck();
  }

  /**
   * 🚪 CERRAR SESIÓN
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // El guard se encargará de la redirección
      },
      error: (error) => {
        // console.error('Error al cerrar sesión:', error);
        // Forzar limpieza local
        localStorage.clear();
        window.location.href = '/auth/login';
      }
    });
  }
}

/**
 * WIDGETS DEL DASHBOARD: Cargan datos de usuario, grupos recientes y acciones rápidas.
 * RecentGroupsComponent: GET /api/grupos (GrupoService.obtenerGrupos())
 * QuickActionsComponent: Navegación a rutas principales (alta grupo, alta gasto, etc.)
 * Feedback visual y manejo de errores implementado en widgets.
 */