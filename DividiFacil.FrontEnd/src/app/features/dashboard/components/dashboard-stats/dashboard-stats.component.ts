import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { EstadisticasService } from '../../../../core/services/estadisticas.service';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

interface DashboardStats {
  totalGrupos: number;
  balanceTotal: number;
  gastosDelMes: number;
  notificaciones: number;
}

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.scss'],
  imports: [
    CommonModule,
    CardComponent,
    
    CurrencyFormatPipe
  ]
})
export class DashboardStatsComponent implements OnInit {
  stats: DashboardStats = {
    totalGrupos: 0,
    balanceTotal: 0,
    gastosDelMes: 0,
    notificaciones: 0
  };
  
  loading = true;
  error: string | null = null;

  constructor(private estadisticasService: EstadisticasService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  /**
   * 🔧 CORREGIDO: Usar EstadisticasService en lugar de llamadas directas
   */
  cargarEstadisticas(): void {
    this.loading = true;
    this.error = null;

    this.estadisticasService.obtenerEstadisticasUsuario().subscribe({
      next: (estadisticas) => {
        this.loading = false;
        this.stats = {
          totalGrupos: estadisticas.totalGrupos,
          balanceTotal: estadisticas.balanceTotal,
          gastosDelMes: estadisticas.gastosDelMes,
          notificaciones: estadisticas.notificacionesPendientes
        };
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al cargar estadísticas';
        console.error('Error cargando estadísticas:', err);
      }
    });
  }

  refrescar(): void {
    this.cargarEstadisticas();
  }
}