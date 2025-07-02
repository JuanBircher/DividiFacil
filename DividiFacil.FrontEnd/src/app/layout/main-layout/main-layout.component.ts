import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../core/auth.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Subject, takeUntil, Observable } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatBadgeModule,
    RouterModule
  ]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  nombreUsuario = localStorage.getItem('nombreUsuario') || '';
  gruposMenuAbierto = false;
  
  // ✅ CORRECCIÓN: Declarar como Observable sin inicializar inmediatamente
  contadorNotificaciones$: Observable<number>;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notificacionService: NotificacionService
  ) {
    // ✅ CORRECCIÓN: Inicializar en constructor después de inyección
    this.contadorNotificaciones$ = this.notificacionService.contadorNoLeidas$;
  }

  ngOnInit(): void {
    // Cargar contador inicial
    this.notificacionService.obtenerPendientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleGruposMenu() {
    this.gruposMenuAbierto = !this.gruposMenuAbierto;
  }
}