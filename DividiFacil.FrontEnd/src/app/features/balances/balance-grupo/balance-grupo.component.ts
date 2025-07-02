// src/app/features/balances/balance-grupo/balance-grupo.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';

// Services y Models
import { BalanceService } from '../../../core/services/balance.service';
import { BalanceGrupoDto, DeudaSimplificadaDto } from '../../../core/models/balance.model'; // ✅ CORREGIDO
import { ApiResponse } from '../../../core/models/response.model';

// Pipes
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-balance-grupo',
  standalone: true,
  templateUrl: './balance-grupo.component.html',
  styleUrls: ['./balance-grupo.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule,
    CurrencyFormatPipe
  ]
})
export class BalanceGrupoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estados
  loading = false;
  procesando = false;
  
  // Datos
  balanceGrupo: BalanceGrupoDto | null = null; // ✅ CORREGIDO
  idGrupo = '';
  
  // Configuración tabla
  displayedColumnsBalance = ['usuario', 'totalPagado', 'deberiaHaberPagado', 'balance', 'acciones']; // ✅ CORREGIDO
  displayedColumnsDeudas = ['deudor', 'acreedor', 'monto', 'acciones'];

  constructor(
    private balanceService: BalanceService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.idGrupo = params['id'];
        if (this.idGrupo) {
          this.cargarBalance();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🔄 CARGAR BALANCE DEL GRUPO
   */
  cargarBalance(): void {
    this.loading = true;

    this.balanceService.obtenerBalanceGrupo(this.idGrupo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<BalanceGrupoDto>) => { // ✅ CORREGIDO
          this.loading = false;
          if (response.exito && response.data) {
            this.balanceGrupo = response.data;
          } else {
            this.snackBar.open('Error al cargar balance', 'Cerrar', { duration: 3000 });
          }
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error al cargar balance:', err);
          this.snackBar.open('Error al cargar balance del grupo', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * 💰 CREAR PAGO DESDE DEUDA
   */
  crearPagoDesdeDeuda(deuda: DeudaSimplificadaDto): void { // ✅ CORREGIDO
    this.router.navigate(['/alta-pagos'], {
      queryParams: {
        idGrupo: this.idGrupo,
        idReceptor: deuda.idUsuarioAcreedor,  // ✅ Campo correcto
        monto: deuda.monto,
        concepto: `Pago de deuda a ${deuda.nombreUsuarioAcreedor}` // ✅ Campo correcto
      }
    });
  }

  /**
   * 📊 VER DETALLE USUARIO
   */
  verDetalleUsuario(idUsuario: string): void {
    this.router.navigate(['/balance-usuario', idUsuario], {
      queryParams: { idGrupo: this.idGrupo }
    });
  }

  /**
   * 🔙 VOLVER AL GRUPO
   */
  volverAlGrupo(): void {
    this.router.navigate(['/grupos', this.idGrupo]);
  }

  /**
   * 🎨 OBTENER COLOR BALANCE
   */
  obtenerColorBalance(balance: number): string {
    if (balance > 0) return 'primary';
    if (balance < 0) return 'warn';
    return 'accent';
  }

  /**
   * 🎨 OBTENER ICONO BALANCE
   */
  obtenerIconoBalance(balance: number): string {
    if (balance > 0) return 'trending_up';
    if (balance < 0) return 'trending_down';
    return 'trending_flat';
  }

  /**
   * 🎨 OBTENER ESTADO BALANCE
   */
  obtenerEstadoBalance(balance: number): string {
    if (balance > 0) return 'Acreedor';
    if (balance < 0) return 'Deudor';
    return 'Equilibrado';
  }

  /**
   * 🔢 TRACKBY FUNCTION
   */
  trackByUsuario(index: number, item: any): string {
    return item.idUsuario;
  }

  trackByDeuda(index: number, item: DeudaSimplificadaDto): string { // ✅ CORREGIDO
    return `${item.idUsuarioDeudor}-${item.idUsuarioAcreedor}`;
  }
}