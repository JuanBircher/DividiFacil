import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

// Services y Models
import { PagoService } from '../../../core/services/pago.service';
import { PagoDto } from '../../../core/models/pago.model';
import { AuthService } from '../../../core/auth.service';

// Pipes
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-detalle-pagos',
  standalone: true,
  templateUrl: './detalle-pagos.component.html',
  styleUrls: ['./detalle-pagos.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    DateFormatPipe,
    CurrencyFormatPipe
  ]
})
export class DetallePagosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estados
  loading = false;
  procesando = false;
  
  // Datos
  pago: PagoDto | null = null;
  idPago = '';
  usuarioActual: any;

  constructor(
    private pagoService: PagoService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuario();
    
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.idPago = params['id'];
        if (this.idPago) {
          this.cargarPago();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🔄 CARGAR PAGO
   */
  cargarPago(): void {
    this.loading = true;

    this.pagoService.obtenerPago(this.idPago)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.exito && response.data) {
            this.pago = response.data;
          } else {
            this.snackBar.open('Pago no encontrado', 'Cerrar', { duration: 3000 });
            this.volver();
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al cargar pago:', err);
          this.snackBar.open('Error al cargar pago', 'Cerrar', { duration: 3000 });
          this.volver();
        }
      });
  }

  /**
   * ✅ CONFIRMAR PAGO
   */
  confirmarPago(): void {
    if (!this.pago || !this.puedeConfirmar()) return;

    this.procesando = true;

    this.pagoService.confirmarPago(this.pago.idPago)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.procesando = false;
          if (response.exito) {
            this.snackBar.open('¡Pago confirmado exitosamente!', 'Cerrar', { 
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.cargarPago(); // Recargar para ver cambio de estado
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
   * ❌ RECHAZAR PAGO
   */
  rechazarPago(): void {
    if (!this.pago || !this.puedeRechazar()) return;

    const motivo = prompt('¿Por qué rechazas este pago? (Opcional):');
    
    this.procesando = true;

    this.pagoService.rechazarPago(this.pago.idPago, motivo || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.procesando = false;
          if (response.exito) {
            this.snackBar.open('Pago rechazado', 'Cerrar', { duration: 3000 });
            this.cargarPago(); // Recargar para ver cambio de estado
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
   * 🔙 VOLVER
   */
  volver(): void {
    this.router.navigate(['/pagos']);
  }

  /**
   * 🎯 VERIFICAR PERMISOS
   */
  puedeConfirmar(): boolean {
    return this.pago?.estado === 'Pendiente' && 
           this.pago?.idReceptor === this.usuarioActual?.idUsuario;
  }

  puedeRechazar(): boolean {
    return this.pago?.estado === 'Pendiente' && 
           this.pago?.idReceptor === this.usuarioActual?.idUsuario;
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
}