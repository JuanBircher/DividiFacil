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
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group
} from '@angular/animations';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatBadgeModule,
    RouterModule
  ],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter, :leave', [
          style({
            position: 'absolute',
            left: 0,
            width: '100%',
            opacity: 0,
            transform: 'translateY(16px)'
          })
        ], { optional: true }),
        group([
          query(':leave', [
            animate('200ms cubic-bezier(.4,0,.2,1)', style({ opacity: 0, transform: 'translateY(-16px)' }))
          ], { optional: true }),
          query(':enter', [
            animate('300ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'none' }))
          ], { optional: true })
        ])
      ])
    ])
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
    console.log('[MainLayoutComponent] Constructor ejecutado');
    // ✅ CORRECCIÓN: Inicializar en constructor después de inyección
    this.contadorNotificaciones$ = this.notificacionService.contadorNoLeidas$;
  }

  ngOnInit(): void {
    // Cargar contador inicial
    const idUsuario = localStorage.getItem('idUsuario') || '';
    this.notificacionService.obtenerPendientes(idUsuario)
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

  getRouteAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}