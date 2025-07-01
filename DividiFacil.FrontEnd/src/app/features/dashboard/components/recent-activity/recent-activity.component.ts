import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { CajaComunService } from '../../../../core/services/caja-comun.service';
import { GastoService } from '../../../../core/services/gasto.service';
import { PagoService } from '../../../../core/services/pago.service';
import { MovimientoCajaDto } from '../../../../core/models/caja-comun.model';
import { GastoDto } from '../../../../core/models/gasto.model';
import { PagoDto } from '../../../../core/models/pago.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';
import { forkJoin, map } from 'rxjs';

interface ActivityItem {
  id: string;
  tipo: 'movimiento' | 'gasto' | 'pago';
  concepto: string;
  monto: number;
  fecha: string;
  estado?: string;
  icono: string;
  color: 'primary' | 'accent' | 'warn' | 'success';
  usuarioRelacionado?: string;
  grupoRelacionado?: string;
  accion?: () => void;
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    CardComponent,
    LoadingSpinnerComponent,
    DateFormatPipe,
    CurrencyFormatPipe,
    TruncatePipe
  ]
})
export class RecentActivityComponent implements OnInit {
  loading = true;
  error: string | null = null;
  
  // Datos separados por tipo
  movimientos: MovimientoCajaDto[] = [];
  gastos: GastoDto[] = [];
  pagos: PagoDto[] = [];
  
  // Actividad unificada para mostrar
  actividadReciente: ActivityItem[] = [];
  
  // Estados para cada sección
  loadingMovimientos = false;
  loadingGastos = false;
  loadingPagos = false;

  constructor(
    private cajaComunService: CajaComunService,
    private gastoService: GastoService,
    private pagoService: PagoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarActividad();
  }

  /**
   * 🎓 EXPLICACIÓN: Carga toda la actividad reciente del usuario
   * Hace llamadas en paralelo para obtener datos rápidamente
   */
  cargarActividad(): void {
    this.loading = true;
    this.error = null;

    // Solo llamar a métodos que EXISTEN
    forkJoin({
      gastos: this.gastoService.obtenerMisGastos(),
      pagosRealizados: this.pagoService.obtenerPagosRealizados(),
      pagosRecibidos: this.pagoService.obtenerPagosRecibidos()
    }).subscribe({
      next: (responses) => {
        this.loading = false;
        
        // Procesar gastos
        if (responses.gastos.exito && responses.gastos.data) {
          this.gastos = responses.gastos.data.slice(0, 5);
        }
        
        // Combinar pagos realizados y recibidos
        const todosPagos: any[] = [];
        if (responses.pagosRealizados.exito && responses.pagosRealizados.data) {
          todosPagos.push(...responses.pagosRealizados.data);
        }
        if (responses.pagosRecibidos.exito && responses.pagosRecibidos.data) {
          todosPagos.push(...responses.pagosRecibidos.data);
        }
        
        // Ordenar y tomar solo los 5 más recientes
        this.pagos = todosPagos
          .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
          .slice(0, 5);

        // Unificar y ordenar toda la actividad
        this.unificarActividad();
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al cargar actividad reciente';
        console.error('Error cargando actividad:', err);
      }
    });
  }

  /**
   * 🎓 EXPLICACIÓN: Convierte todos los tipos de datos en una lista unificada
   * y los ordena por fecha más reciente
   */
  private unificarActividad(): void {
    const items: ActivityItem[] = [];

    // Convertir gastos a ActivityItems
    this.gastos.forEach(gasto => {
      items.push({
        id: gasto.idGasto,
        tipo: 'gasto',
        concepto: gasto.descripcion,
        monto: gasto.monto,
        fecha: gasto.fechaCreacion,
        icono: 'receipt',
        color: 'warn',
        usuarioRelacionado: gasto.nombrePagador,
        accion: () => this.verDetalleGasto(gasto.idGasto)
      });
    });

    // Convertir pagos a ActivityItems
    this.pagos.forEach(pago => {
      items.push({
        id: pago.idPago,
        tipo: 'pago',
        concepto: pago.concepto,
        monto: pago.monto,
        fecha: pago.fechaCreacion,
        estado: pago.estado,
        icono: this.getIconoPago(pago.estado),
        color: this.getColorPago(pago.estado),
        usuarioRelacionado: pago.nombreReceptor,
        grupoRelacionado: pago.nombreGrupo,
        accion: () => this.verDetallePago(pago.idPago)
      });
    });

    // Ordenar por fecha (más reciente primero) y tomar solo los primeros 10
    this.actividadReciente = items
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 10);
  }

  /**
   * 🎓 EXPLICACIÓN: Obtiene el icono apropiado según el estado del pago
   */
  private getIconoPago(estado: string): string {
    switch (estado) {
      case 'Completado': return 'check_circle';
      case 'Pendiente': return 'schedule';
      case 'Rechazado': return 'cancel';
      default: return 'payment';
    }
  }

  /**
   * 🎓 EXPLICACIÓN: Obtiene el color apropiado según el estado del pago
   */
  private getColorPago(estado: string): 'primary' | 'accent' | 'warn' | 'success' {
    switch (estado) {
      case 'Completado': return 'success';
      case 'Pendiente': return 'accent';
      case 'Rechazado': return 'warn';
      default: return 'primary';
    }
  }

  /**
   * 🎓 EXPLICACIÓN: Navegación a detalles específicos
   */
  verDetalleGasto(idGasto: string): void {
    this.router.navigate(['/gastos/detalle', idGasto]);
  }

  verDetallePago(idPago: string): void {
    this.router.navigate(['/pagos/detalle', idPago]);
  }

  verTodosLosGastos(): void {
    this.router.navigate(['/gastos']);
  }

  verTodosLosPagos(): void {
    this.router.navigate(['/pagos']);
  }

  crearGasto(): void {
    this.router.navigate(['/gastos/alta']);
  }

  /**
   * 🎓 EXPLICACIÓN: Método para refrescar datos
   */
  refrescar(): void {
    this.cargarActividad();
  }

  /**
   * 🎓 EXPLICACIÓN: Filtra actividad por tipo
   */
  filtrarPorTipo(tipo: 'movimiento' | 'gasto' | 'pago' | 'todos'): ActivityItem[] {
    if (tipo === 'todos') {
      return this.actividadReciente;
    }
    return this.actividadReciente.filter(item => item.tipo === tipo);
  }
}