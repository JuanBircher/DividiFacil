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
import { BalanceGrupoDto, DeudaSimplificadaDto } from '../../../core/models/balance.model';
import { ResponseDto } from '../../../core/models/response.model';

// Pipes
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

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
  balanceGrupo: any = null;  // ✅ USAR ESTRUCTURA REAL DEL BACKEND
  idGrupo = '';
  error: string | null = null;

  
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
          this.cargarBalance(this.idGrupo);
        } else {
          this.error = 'ID de grupo no válido';
          this.loading = false;
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
  cargarBalance(idGrupo: string): void {
    this.loading = true;
    this.error = null;

    this.balanceService.obtenerBalanceGrupo(idGrupo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ResponseDto<BalanceGrupoDto>) => {
          this.loading = false;
          if (response.exito && response.data) {
            this.balanceGrupo = response.data;
            console.log('💰 Balance cargado:', this.balanceGrupo);
          } else {
            this.error = response.mensaje || 'Error al cargar balance';
          }
        },
        error: (err: any) => {
          this.loading = false;
          console.error('💥 Error al cargar balance:', err);
          this.error = 'Error al cargar el balance del grupo';
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
        idReceptor: deuda.idUsuarioAcreedor,
        monto: deuda.monto,
        concepto: `Pago de deuda a ${deuda.nombreUsuarioAcreedor}`
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
    const idGrupo = this.route.snapshot.paramMap.get('idGrupo');
    if (idGrupo) {
      this.router.navigate(['/grupos/detalle', idGrupo]);
    }
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