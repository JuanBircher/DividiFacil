import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

// Services y Models
import { NotificacionService } from '../../../core/services/notificacion.service';
import { NotificacionDto } from '../../../core/models/notificacion.model';
import { AuthService } from '../../../core/auth.service';
import { Inject } from '@angular/core';
import { GrupoService } from '../../../core/services/grupo.service';

// Pipes
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-listado',
  standalone: true,
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    DateFormatPipe,
    CardComponent,
    LoadingSpinnerComponent
  ]
})
export class ListadoNotificacionesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estados
  loading = false;
  procesando = false;
  procesandoId: string | null = null;
  
  // Datos
  notificaciones: NotificacionDto[] = [];
  notificacionesNoLeidas: NotificacionDto[] = [];
  notificacionesLeidas: NotificacionDto[] = [];
  idUsuario!: string;
  constructor(
    private notificacionService: NotificacionService,
    private router: Router,
    private snackBar: MatSnackBar,
    @Inject(AuthService) private authService: AuthService,
    private grupoService: GrupoService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuario();
    if (usuario) {
      this.idUsuario = usuario.idUsuario;
      this.cargarNotificaciones();
      this.iniciarPolling();
    } else {
      this.snackBar.open('No se pudo obtener el usuario actual', 'Cerrar', { duration: 3000 });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🔄 CARGAR NOTIFICACIONES
   */
  cargarNotificaciones(): void {
    this.loading = true;
    this.notificacionService.obtenerPendientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.exito && response.data) {
            this.notificaciones = response.data;
            this.separarNotificaciones();
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al cargar notificaciones:', err);
          this.snackBar.open('Error al cargar notificaciones', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * 📊 SEPARAR NOTIFICACIONES POR ESTADO
   */
  private separarNotificaciones(): void {
    this.notificacionesNoLeidas = this.notificaciones.filter(n => n.estado !== 'LEIDA' && n.estado !== 'Leida');
    this.notificacionesLeidas = this.notificaciones.filter(n => n.estado === 'LEIDA' || n.estado === 'Leida');
  }

  /**
   * 🔄 POLLING AUTOMÁTICO
   */
  private iniciarPolling(): void {
    // Actualizar cada 30 segundos
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.procesando) {
          this.cargarNotificacionesSilencioso();
        }
      });
  }

  /**
   * 🔄 CARGAR SIN LOADING (para polling)
   */
  private cargarNotificacionesSilencioso(): void {
    this.notificacionService.obtenerPendientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.exito && response.data) {
            const nuevasNotificaciones = response.data.length;
            const anteriores = this.notificaciones.length;
            this.notificaciones = response.data;
            this.separarNotificaciones();
            // Mostrar notificación si hay nuevas
            if (nuevasNotificaciones > anteriores) {
              this.snackBar.open('¡Tienes nuevas notificaciones!', 'Ver', { 
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            }
          }
        },
        error: (err) => {
          console.error('Error en polling de notificaciones:', err);
        }
      });
  }

  /**
   * ✅ MARCAR COMO LEÍDA
   */
  marcarComoLeida(notificacion: NotificacionDto): void {
    if (notificacion.estado === 'LEIDA' || notificacion.estado === 'Leida') return;
    
    this.procesando = true;
    
    this.notificacionService.marcarComoLeida(notificacion.idNotificacion, this.idUsuario)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.procesando = false;
          if (response.exito) {
            // Actualizar estado local
            notificacion.estado = 'LEIDA';
            this.separarNotificaciones();
            
            this.snackBar.open('Notificación marcada como leída', 'Cerrar', { 
              duration: 2000 
            });
          }
        },
        error: (err) => {
          this.procesando = false;
          console.error('Error al marcar notificación:', err);
          this.snackBar.open('Error al marcar notificación', 'Cerrar', { 
            duration: 3000 
          });
        }
      });
  }

  /**
   * ✅ MARCAR TODAS COMO LEÍDAS
   */
  marcarTodasComoLeidas(): void {
    if (this.notificacionesNoLeidas.length === 0) return;
    
    this.procesando = true;
    
    // Procesar en paralelo
    const promesas = this.notificacionesNoLeidas.map(notificacion =>
      this.notificacionService.marcarComoLeida(notificacion.idNotificacion, this.idUsuario).toPromise()
    );
    
    Promise.all(promesas).then(() => {
      this.procesando = false;
      this.cargarNotificaciones();
      this.snackBar.open('Todas las notificaciones marcadas como leídas', 'Cerrar', { 
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }).catch(err => {
      this.procesando = false;
      console.error('Error al marcar todas:', err);
      this.snackBar.open('Error al marcar notificaciones', 'Cerrar', { 
        duration: 3000 
      });
    });
  }

  /**
   * 👁️ VER DETALLE
   */
  verDetalle(notificacion: NotificacionDto): void {
    // Marcar como leída si no lo está
    if (notificacion.estado !== 'LEIDA') {
      this.marcarComoLeida(notificacion);
    }
    
    // Navegar según el tipo
    this.navegarPorTipo(notificacion);
  }

  /**
   * 🧭 NAVEGACIÓN INTELIGENTE POR TIPO
   */
  private navegarPorTipo(notificacion: NotificacionDto): void {
    switch (notificacion.tipo) {
      case 'GASTO_CREADO':
        this.router.navigate(['/gastos'], { 
          queryParams: { grupo: notificacion.idGrupo } 
        });
        break;
        
      case 'PAGO_RECIBIDO':
      case 'PAGO_SOLICITADO':
        this.router.navigate(['/pagos'], { 
          queryParams: { grupo: notificacion.idGrupo } 
        });
        break;
        
      case 'GRUPO_INVITACION':
        this.router.navigate(['/grupos/detalle'], { 
          queryParams: { id: notificacion.idGrupo } 
        });
        break;
        
      default:
        this.router.navigate(['/notificaciones/detalle'], { 
          queryParams: { id: notificacion.idNotificacion } 
        });
    }
  }

  /**
   * 🎨 OBTENER ICONO POR TIPO
   */
  obtenerIcono(tipo: string): string {
    const iconos: Record<string, string> = {
      'GASTO_CREADO': 'receipt',
      'PAGO_RECIBIDO': 'payments',
      'PAGO_SOLICITADO': 'payment',
      'RECORDATORIO': 'schedule',
      'GRUPO_INVITACION': 'group_add'
    };
    return iconos[tipo] || 'notifications';
  }

  /**
   * 🎨 OBTENER COLOR POR TIPO
   */
  obtenerColor(tipo: string): string {
    const colores: Record<string, string> = {
      'GASTO_CREADO': 'primary',
      'PAGO_RECIBIDO': 'accent',
      'PAGO_SOLICITADO': 'warn',
      'RECORDATORIO': 'primary',
      'GRUPO_INVITACION': 'accent'
    };
    return colores[tipo] || 'primary';
  }

  /**
   * 🎨 OBTENER TÍTULO AMIGABLE
   */
  obtenerTitulo(notificacion: NotificacionDto): string {
    const titulos: Record<string, string> = {
      'GASTO_CREADO': 'Nuevo Gasto',
      'PAGO_RECIBIDO': 'Pago Recibido',
      'PAGO_SOLICITADO': 'Solicitud de Pago',
      'RECORDATORIO': 'Recordatorio',
      'GRUPO_INVITACION': 'Invitación a Grupo'
    };
    return titulos[notificacion.tipo] || 'Notificación';
  }

  /**
   * 🔄 RECARGAR MANUALMENTE
   */
  recargar(): void {
    this.cargarNotificaciones();
  }

  /**
   * 🎯 TRACK BY PARA PERFORMANCE
   */
  trackByNotificacion(index: number, notificacion: NotificacionDto): string {
    return notificacion.idNotificacion;
  }

  /**
   * 🤝 ACEPTAR INVITACIÓN A GRUPO
   */
  aceptarInvitacion(notificacion: NotificacionDto): void {
    if (notificacion.tipo !== 'GRUPO_INVITACION' || this.procesandoId) return;
    this.procesandoId = notificacion.idNotificacion;
    const invitacion = { emailInvitado: notificacion.nombreUsuario || '' };
    this.grupoService.agregarMiembro(notificacion.idGrupo, invitacion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.exito) {
            this.marcarComoLeida(notificacion);
            this.snackBar.open('¡Te has unido al grupo!', 'Cerrar', { duration: 2500, panelClass: ['success-snackbar'] });
          } else {
            this.snackBar.open(response.mensaje || 'No se pudo unir al grupo', 'Cerrar', { duration: 3000 });
          }
          this.procesandoId = null;
        },
        error: (err) => {
          this.snackBar.open('Error al aceptar invitación', 'Cerrar', { duration: 3000 });
          this.procesandoId = null;
        }
      });
  }

  /**
   * ❌ RECHAZAR INVITACIÓN A GRUPO
   */
  rechazarInvitacion(notificacion: NotificacionDto): void {
    if (notificacion.tipo !== 'GRUPO_INVITACION' || this.procesandoId) return;
    this.procesandoId = notificacion.idNotificacion;
    // Simulación: marcar como leída y mostrar feedback (ajustar si hay endpoint específico)
    this.marcarComoLeida(notificacion);
    this.snackBar.open('Invitación rechazada', 'Cerrar', { duration: 2000 });
    this.procesandoId = null;
  }
}
