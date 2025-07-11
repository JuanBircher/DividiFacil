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
import { OnboardingService } from '../../shared/services/onboarding.service';
import { OnboardingComponent } from '../../shared/components/onboarding/onboarding.component';

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
    RouterModule,
    OnboardingComponent
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
  saludoPersonalizado: string = '';
  horaActual: string = '';
  gruposMenuAbierto = false;
  
  contadorNotificaciones$: Observable<number>;
  mostrarOnboarding = false;

  public darkMode: boolean = false;
  public toggleDarkMode: () => void = () => {};

  constructor(
    private authService: AuthService, 
    private router: Router,
    private notificacionService: NotificacionService,
    private onboardingService: OnboardingService
  ) {
    console.log('[MainLayoutComponent] Constructor ejecutado');
    this.contadorNotificaciones$ = this.notificacionService.contadorNoLeidas$;
  }

  ngOnInit(): void {
    // Cargar contador inicial
    this.notificacionService.obtenerPendientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    this.setSaludoYHora();
    setInterval(() => this.setSaludoYHora(), 60000);
    this.mostrarOnboarding = !this.onboardingService.isOnboardingCompleted();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Incluso si hay error, limpiar sesión y navegar
        this.router.navigate(['/auth/login']);
      }
    });
  }

  toggleGruposMenu() {
    this.gruposMenuAbierto = !this.gruposMenuAbierto;
  }

  getRouteAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  setSaludoYHora() {
    // Saludo
    const hora = new Date().getHours();
    if (hora < 12) {
      this.saludoPersonalizado = '¡Buenos días';
    } else if (hora < 18) {
      this.saludoPersonalizado = '¡Buenas tardes';
    } else {
      this.saludoPersonalizado = '¡Buenas noches';
    }
    // Hora actual
    const ahora = new Date();
    this.horaActual = ahora.toLocaleString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onFinishOnboarding() {
    this.onboardingService.completeOnboarding();
    this.mostrarOnboarding = false;
  }

  goToPerfil() {
    this.router.navigate(['/perfil']);
  }

  goToConfiguracion() {
    this.router.navigate(['/dashboard']);
  }
}