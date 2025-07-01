import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { GrupoService } from '../../../../core/services/grupo.service';
import { CajaComunService } from '../../../../core/services/caja-comun.service';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { forkJoin } from 'rxjs';

interface DashboardStats {
  totalGrupos: number;
  gastosDelMes: number;
  notificaciones: number;
  balanceTotal: number;
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
    gastosDelMes: 0,
    notificaciones: 0,
    balanceTotal: 0
  };
  
  loading = true;
  error: string | null = null;

  constructor(
    private grupoService: GrupoService,
    private cajaComunService: CajaComunService
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  /**
   * 🎓 EXPLICACIÓN: Carga todas las estadísticas en paralelo
   * Usa forkJoin para hacer múltiples llamadas HTTP simultáneamente
   */
  cargarEstadisticas(): void {
    this.loading = true;
    this.error = null;

    // Hacer todas las llamadas en paralelo
    forkJoin({
      grupos: this.grupoService.getGrupos(),
      estadisticasCajas: this.cajaComunService.obtenerEstadisticas()
    }).subscribe({
      next: (responses) => {
        this.loading = false;
        
        // Procesar respuesta de grupos
        if (responses.grupos.exito && responses.grupos.data) {
          this.stats.totalGrupos = responses.grupos.data.length;
        }

        // Procesar respuesta de estadísticas de cajas
        if (responses.estadisticasCajas.exito && responses.estadisticasCajas.data) {
          const estadisticas = responses.estadisticasCajas.data;
          this.stats.balanceTotal = estadisticas.balanceTotal || 0;
          this.stats.gastosDelMes = estadisticas.gastosDelMes || 0;
        }

        // Por ahora, notificaciones simuladas (cuando tengas el servicio, cambiar)
        this.stats.notificaciones = Math.floor(Math.random() * 5) + 1;
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al cargar estadísticas';
        console.error('Error cargando stats:', err);
      }
    });
  }

  /**
   * 🎓 EXPLICACIÓN: Método para refrescar datos
   */
  refrescar(): void {
    this.cargarEstadisticas();
  }
}