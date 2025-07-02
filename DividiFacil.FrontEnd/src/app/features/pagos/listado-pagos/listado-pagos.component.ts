import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

// Services y Models - USANDO TUS SERVICIOS EXACTOS
import { PagoService } from '../../../core/services/pago.service';
import { PagoDto } from '../../../core/models/pago.model';
import { AuthService } from '../../../core/auth.service';

// Pipes - USANDO TUS PIPES EXISTENTES
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-listado-pagos',
  standalone: true,
  templateUrl: './listado-pagos.component.html',
  styleUrls: ['./listado-pagos.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTabsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatBadgeModule,
    DateFormatPipe,
    CurrencyFormatPipe
  ]
})
export class ListadoPagosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estados
  loading = false;
  procesando = false;
  
  // Datos - USANDO TUS TIPOS EXACTOS
  pagosRealizados: PagoDto[] = [];
  pagosRecibidos: PagoDto[] = [];
  todosLosPagos: PagoDto[] = [];
  
  // Filtros
  idGrupoFiltro = '';
  usuarioActual: any;
  
  // UI
  tabSelectedIndex = 0;
  displayedColumns = ['fecha', 'concepto', 'receptor', 'monto', 'estado', 'acciones'];

  constructor(
    private pagoService: PagoService, // TU SERVICIO EXACTO
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuario();
    
    // Verificar si viene filtro por grupo
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.idGrupoFiltro = params['idGrupo'] || '';
        this.cargarPagos();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🔄 CARGAR PAGOS - USANDO TUS SERVICIOS EXACTOS
   */
  cargarPagos(): void {
    this.loading = true;

    if (this.idGrupoFiltro) {
      // Cargar pagos de un grupo específico
      this.pagoService.obtenerPagosPorGrupo(this.idGrupoFiltro)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.loading = false;
            if (response.exito && response.data) {
              this.todosLosPagos = response.data;
              this.separarPagosPorTipo();
            }
          },
          error: (err) => {
            this.loading = false;
            console.error('Error al cargar pagos del grupo:', err);
            this.snackBar.open('Error al cargar pagos', 'Cerrar', { duration: 3000 });
          }
        });
    } else {
      // Cargar todos los pagos del usuario
      this.pagoService.obtenerMisPagos()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.loading = false;
            if (response.exito && response.data) {
              this.todosLosPagos = response.data;
              this.separarPagosPorTipo();
            }
          },
          error: (err) => {
            this.loading = false;
            console.error('Error al cargar pagos:', err);
            this.snackBar.open('Error al cargar pagos', 'Cerrar', { duration: 3000 });
          }
        });
    }
  }

  /**
   * 📊 SEPARAR PAGOS POR TIPO
   */
  private separarPagosPorTipo(): void {
    if (!this.usuarioActual?.idUsuario) return;

    this.pagosRealizados = this.todosLosPagos.filter(
      pago => pago.idPagador === this.usuarioActual.idUsuario
    );

    this.pagosRecibidos = this.todosLosPagos.filter(
      pago => pago.idReceptor === this.usuarioActual.idUsuario
    );
  }

  /**
   * ✅ CONFIRMAR PAGO - USANDO TU SERVICIO EXACTO
   */
  confirmarPago(pago: PagoDto): void {
    if (pago.estado !== 'Pendiente') return;

    this.procesando = true;

    this.pagoService.confirmarPago(pago.idPago)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.procesando = false;
          if (response.exito) {
            this.snackBar.open('¡Pago confirmado exitosamente!', 'Cerrar', { 
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.cargarPagos(); // Recargar datos
          }
        },
        error: (err) => {
          this.procesando = false;
          console.error('Error al confirmar pago:', err);
          this.snackBar.open('Error al confirmar pago', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * ❌ RECHAZAR PAGO - USANDO TU SERVICIO EXACTO
   */
  rechazarPago(pago: PagoDto): void {
    if (pago.estado !== 'Pendiente') return;

    const motivo = prompt('¿Por qué rechazas este pago? (Opcional):');
    
    this.procesando = true;

    this.pagoService.rechazarPago(pago.idPago, motivo || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.procesando = false;
          if (response.exito) {
            this.snackBar.open('Pago rechazado', 'Cerrar', { duration: 3000 });
            this.cargarPagos(); // Recargar datos
          }
        },
        error: (err) => {
          this.procesando = false;
          console.error('Error al rechazar pago:', err);
          this.snackBar.open('Error al rechazar pago', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * 👁️ VER DETALLE
   */
  verDetalle(pago: PagoDto): void {
    this.router.navigate(['/pagos/detalle', pago.idPago]);
  }

  /**
   * ➕ CREAR PAGO
   */
  crearPago(): void {
    this.router.navigate(['/pagos/alta'], {
      queryParams: this.idGrupoFiltro ? { idGrupo: this.idGrupoFiltro } : {}
    });
  }

  /**
   * 🎨 OBTENER COLOR DE ESTADO
   */
  obtenerColorEstado(estado: string): string {
    const colores: Record<string, string> = {
      'Pendiente': 'warn',
      'Completado': 'primary',
      'Rechazado': 'accent'
    };
    return colores[estado] || 'primary';
  }

  /**
   * 🎨 OBTENER ICONO DE ESTADO
   */
  obtenerIconoEstado(estado: string): string {
    const iconos: Record<string, string> = {
      'Pendiente': 'schedule',
      'Completado': 'check_circle',
      'Rechazado': 'cancel'
    };
    return iconos[estado] || 'help';
  }

  /**
   * 🔄 RECARGAR
   */
  recargar(): void {
    this.cargarPagos();
  }

  /**
   * 🔙 VOLVER (si viene desde grupo)
   */
  volver(): void {
    if (this.idGrupoFiltro) {
      this.router.navigate(['/grupos/detalle', this.idGrupoFiltro]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * 🎯 TRACKING PARA PERFORMANCE
   */
  trackByPago(index: number, pago: PagoDto): string {
    return pago.idPago;
  }

  /**
   * 🎯 VERIFICAR PERMISOS
   */
  puedeConfirmar(pago: PagoDto): boolean {
    return pago.estado === 'Pendiente' && 
           pago.idReceptor === this.usuarioActual?.idUsuario;
  }

  puedeRechazar(pago: PagoDto): boolean {
    return pago.estado === 'Pendiente' && 
           pago.idReceptor === this.usuarioActual?.idUsuario;
  }
}
