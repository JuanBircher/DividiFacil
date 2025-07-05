import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, forkJoin } from 'rxjs';

// ✅ SOLO SERVICIOS QUE EXISTEN
import { GastoService } from '../../../../core/services/gasto.service';
import { GrupoService } from '../../../../core/services/grupo.service';

// ✅ PIPES CORRECTOS
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

interface EstadisticaDashboard {
  titulo: string;
  valor: number | string;
  icono: string;
  color: string;
  subtitulo?: string;
  tendencia?: 'up' | 'down' | 'stable';
}

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ]
})
export class DashboardStatsComponent implements OnInit, OnDestroy {
  estadisticas: EstadisticaDashboard[] = [];
  cargando = false;
  loading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private gastoService: GastoService,
    private grupoService: GrupoService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarEstadisticas(): void {
    this.cargando = true;
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck(); 

    forkJoin({
      grupos: this.grupoService.obtenerGrupos(),
      gastos: this.gastoService.obtenerRecientes(50)
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        console.log('📊 Datos para estadísticas:', data);
        this.procesarEstadisticas(data);
        this.cargando = false;
        this.loading = false;
        this.cdr.markForCheck(); 
      },
      error: (error) => {
        console.error('❌ Error al cargar estadísticas:', error);
        this.error = 'Error al cargar las estadísticas.';
        this.cargando = false;
        this.loading = false;
        this.cdr.markForCheck(); 
      }
    });
  }

  private procesarEstadisticas(data: any): void {
    console.log('🔄 Procesando estadísticas:', data);
    
    // ✅ DATOS DE GRUPOS
    const grupos = Array.isArray(data.grupos) ? data.grupos : (data.grupos?.data || []);
    
    // ✅ DATOS DE GASTOS
    const gastos = data.gastos?.data || [];
    
    // ✅ CALCULAR MÉTRICAS
    const totalGrupos = grupos.length;
    const totalGastos = gastos.reduce((sum: number, gasto: any) => sum + (gasto.monto || 0), 0);
    const gastosEsteMes = this.calcularGastosEsteMes(gastos);
    const gruposActivos = grupos.filter((g: any) => g.estadoGrupo !== 'Inactivo').length;

    this.estadisticas = [
      {
        titulo: 'Total Grupos',
        valor: totalGrupos,
        icono: 'group',
        color: 'primary',
        subtitulo: `${gruposActivos} activos`,
        tendencia: totalGrupos > 0 ? 'up' : 'stable'
      },
      {
        titulo: 'Gastos del Mes',
        valor: gastosEsteMes,
        icono: 'calendar_month',
        color: 'accent',
        subtitulo: 'Este mes',
        tendencia: gastosEsteMes > 0 ? 'up' : 'stable'
      },
      {
        titulo: 'Monto Total',
        valor: totalGastos,
        icono: 'account_balance_wallet',
        color: 'warn',
        subtitulo: 'En gastos',
        tendencia: totalGastos > 0 ? 'up' : 'stable'
      },
      {
        titulo: 'Gastos Totales',
        valor: gastos.length,
        icono: 'receipt_long',
        color: 'primary',
        subtitulo: 'Registrados',
        tendencia: gastos.length > 0 ? 'up' : 'stable'
      }
    ];
    
    console.log('📊 Estadísticas calculadas:', this.estadisticas);
  }

  private calcularGastosEsteMes(gastos: any[]): number {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();
    
    return gastos.filter(gasto => {
      const fechaGasto = new Date(gasto.fechaCreacion || gasto.fechaGasto);
      return fechaGasto.getMonth() === mesActual && 
             fechaGasto.getFullYear() === añoActual;
    }).length;
  }

  trackByEstadisticaTitulo = (index: number, item: EstadisticaDashboard): string => item.titulo;

  refrescar(): void {
    this.cargarEstadisticas();
  }
}