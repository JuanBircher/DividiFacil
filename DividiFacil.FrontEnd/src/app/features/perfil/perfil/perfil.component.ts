import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

// Services y Models
import { AuthService } from '../../../core/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.model';
import { OnboardingService } from '../../../shared/services/onboarding.service';

// Pipes
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    DateFormatPipe,
    CardComponent,
    LoadingSpinnerComponent
  ]
})
export class PerfilComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estados
  loading = false;
  
  // Datos
  usuario: Usuario | null = null;
  estadisticasUsuario = {
    gruposActivos: 0,
    gastosRegistrados: 0,
    totalGastado: 0,
    diasRegistrado: 0
  };

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router,
    private snackBar: MatSnackBar,
    private onboardingService: OnboardingService
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🔄 CARGAR DATOS DEL USUARIO
   */
  cargarDatosUsuario(): void {
    this.loading = true;
    
    // Obtener usuario actual del AuthService
    const usuarioToken = this.authService.obtenerUsuario();
    if (!usuarioToken?.idUsuario) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Cargar datos completos del usuario
    this.usuarioService.obtenerUsuario(usuarioToken.idUsuario)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.exito && response.data) {
            this.usuario = response.data;
            this.calcularEstadisticas();
          } else {
            this.snackBar.open(response.mensaje || 'Error al cargar perfil', 'Cerrar', { duration: 3000 });
          }
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open('Error al cargar perfil', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * 📊 CALCULAR ESTADÍSTICAS DEL USUARIO
   */
  private calcularEstadisticas(): void {
    if (!this.usuario) return;

    // Calcular días registrado
    const fechaRegistro = new Date(this.usuario.fechaRegistro);
    const hoy = new Date();
    const diffTime = Math.abs(hoy.getTime() - fechaRegistro.getTime());
    this.estadisticasUsuario.diasRegistrado = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  }

  /**
   * ✏️ EDITAR PERFIL
   */
  editarPerfil(): void {
    this.router.navigate(['/perfil/editar']);
  }

  /**
   * 🔄 RECARGAR DATOS
   */
  recargar(): void {
    this.cargarDatosUsuario();
  }

  /**
   * 🔐 CERRAR SESIÓN
   */
  cerrarSesion(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Cerrar sesión local aunque falle la llamada al servidor
        localStorage.clear();
        this.router.navigate(['/auth/login']);
      }
    });
  }

  /**
   * 🎨 OBTENER INICIALES PARA AVATAR
   */
  obtenerIniciales(): string {
    if (!this.usuario?.nombre) return 'U';

    const palabras = this.usuario.nombre.split(' ');
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return palabras[0][0].toUpperCase();
  }

  /**
   * 🎨 OBTENER ESTADO DE USUARIO
   */
  obtenerEstadoUsuario(): { texto: string; color: string } {
    return { texto: 'Registrado', color: 'primary' };
  }

  /**
   * 🖼️ MANEJAR ERROR DE IMAGEN
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  /**
   * 🔄 REINICIAR ONBOARDING
   */
  reiniciarOnboarding(): void {
    this.onboardingService.resetOnboarding();
    this.snackBar.open('Onboarding reiniciado. Recarga la página para ver el tour.', 'Cerrar', { duration: 4000 });
  }
}

// ENDPOINT CONSUMIDO: GET /api/usuarios/perfil (Perfil del usuario autenticado)
// Servicio: UsuarioService.obtenerPerfil()
// Feedback visual y manejo de errores implementado.
