import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/response.model';
import { GrupoService } from './grupo.service';
import { NotificacionService } from './notificacion.service';
import { GastoService } from './gasto.service';

interface EstadisticasUsuario {
  totalGrupos: number;
  balanceTotal: number;
  gastosDelMes: number;
  notificacionesPendientes: number;
}

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private readonly apiUrl = `${environment.apiUrl}/api/estadisticas`;

  constructor(
    private grupoService: GrupoService,
    private notificacionService: NotificacionService,
    private gastoService: GastoService
  ) {}

  /**
   * 🔧 MÉTODO PARA DASHBOARD: Obtiene estadísticas globales del usuario
   * Combina múltiples servicios ya que no existe endpoint unificado
   */
  obtenerEstadisticasUsuario(idUsuario: string): Observable<EstadisticasUsuario> {
    console.log('[EstadisticasService] obtenerEstadisticasUsuario', { idUsuario });
    return forkJoin({
      grupos: this.grupoService.getGrupos(),
      notificaciones: this.notificacionService.obtenerPendientes(idUsuario),
      gastos: this.gastoService.obtenerMisGastos()
    }).pipe(
      map(responses => {
        const estadisticas: EstadisticasUsuario = {
          totalGrupos: 0,
          balanceTotal: 0,
          gastosDelMes: 0,
          notificacionesPendientes: 0
        };

        // Procesar grupos
        if (responses.grupos.exito && responses.grupos.data) {
          estadisticas.totalGrupos = responses.grupos.data.length;
        }

        // Procesar notificaciones
        if (responses.notificaciones.exito && responses.notificaciones.data) {
          estadisticas.notificacionesPendientes = responses.notificaciones.data.length;
        }

        // Calcular gastos del mes actual
        if (responses.gastos.exito && responses.gastos.data) {
          estadisticas.gastosDelMes = this.calcularGastosDelMes(responses.gastos.data);
        }

        // Balance total: 0 por ahora (necesita implementación específica)
        estadisticas.balanceTotal = 0;

        return estadisticas;
      })
    );
  }

  /**
   * 🔧 HELPER: Calcula gastos del mes actual
   */
  private calcularGastosDelMes(gastos: any[]): number {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const añoActual = fechaActual.getFullYear();

    return gastos
      .filter(gasto => {
        const fechaGasto = new Date(gasto.fechaCreacion);
        return fechaGasto.getMonth() === mesActual && 
               fechaGasto.getFullYear() === añoActual;
      })
      .reduce((total, gasto) => total + gasto.monto, 0);
  }
}