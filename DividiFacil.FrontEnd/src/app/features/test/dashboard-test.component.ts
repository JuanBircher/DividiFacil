import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { GastoService } from '../../core/services/gasto.service';
import { GrupoService } from '../../core/services/grupo.service';
import { BalanceService } from '../../core/services/balance.service';
import { NotificacionService } from '../../core/services/notificacion.service';

@Component({
  selector: 'app-dashboard-test',
  standalone: true,
  template: `
    <div class="test-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>🏠 Pruebas de Dashboard</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>📊 Cargar Estadísticas</mat-panel-title>
            </mat-expansion-panel-header>
            
            <div class="test-section">
              <button mat-raised-button color="primary" (click)="probarEstadisticas()" [disabled]="loading">
                {{ loading ? 'Cargando...' : 'Probar Estadísticas' }}
              </button>
              
              <div *ngIf="estadisticas" class="result">
                <h4>✅ Estadísticas calculadas:</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <strong>Grupos:</strong> {{ estadisticas.totalGrupos }}
                  </div>
                  <div class="stat-item">
                    <strong>Gastos:</strong> {{ estadisticas.totalGastos }}
                  </div>
                  <div class="stat-item">
                    <strong>Monto Total:</strong> {{ estadisticas.montoTotal | currency:'ARS':'symbol-narrow':'1.0-0' }}
                  </div>
                </div>
              </div>
            </div>
          </mat-expansion-panel>

          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>🎯 Probar Actividad Reciente</mat-panel-title>
            </mat-expansion-panel-header>
            
            <div class="test-section">
              <button mat-raised-button color="accent" (click)="probarActividad()" [disabled]="loading">
                {{ loading ? 'Cargando...' : 'Probar Actividad' }}
              </button>
              
              <div *ngIf="actividadReciente.length > 0" class="result">
                <h4>✅ Actividad encontrada: {{actividadReciente.length}} items</h4>
                <div *ngFor="let item of actividadReciente" class="activity-item">
                  <span class="activity-type">{{item.tipo}}</span>
                  <strong>{{item.descripcion}}</strong>
                  <span class="activity-date">{{item.fecha | date:'short'}}</span>
                </div>
              </div>
            </div>
          </mat-expansion-panel>

          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>💰 Probar Balance de Usuario</mat-panel-title>
            </mat-expansion-panel-header>
            
            <div class="test-section">
              <button mat-raised-button color="warn" (click)="probarBalanceUsuario()">
                Probar Balance
              </button>
              
              <div *ngIf="balanceUsuario" class="result">
                <h4>✅ Balance del Usuario:</h4>
                <pre>{{ balanceUsuario | json }}</pre>
              </div>
            </div>
          </mat-expansion-panel>

          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>🔔 Probar Notificaciones Pendientes</mat-panel-title>
            </mat-expansion-panel-header>
            
            <div class="test-section">
              <button mat-raised-button color="accent" (click)="probarNotificacionesPendientes()">
                Probar Notificaciones
              </button>
              
              <div *ngIf="notificacionesPendientes" class="result">
                <h4>✅ Notificaciones Pendientes:</h4>
                <pre>{{ notificacionesPendientes | json }}</pre>
              </div>
            </div>
          </mat-expansion-panel>
          
          <div class="results" *ngIf="testResult">
            <h3>📊 Último Resultado</h3>
            <pre>{{ testResult | json }}</pre>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .test-container { max-width: 900px; margin: 2rem auto; padding: 1rem; }
    .test-section { margin: 1rem 0; padding: 1rem; }
    .result { margin-top: 1rem; padding: 1rem; background: #f0f8ff; border-radius: 4px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .stat-item { padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
    .activity-item { padding: 0.5rem; border-bottom: 1px solid #eee; display: flex; gap: 1rem; align-items: center; }
    .activity-type { background: #e3f2fd; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
    .activity-date { color: #666; font-size: 0.9rem; }
    .results { margin-top: 2rem; padding: 1rem; background: #f5f5f5; border-radius: 8px; }
    pre { font-size: 12px; overflow-x: auto; max-height: 300px; }
    mat-expansion-panel { margin: 1rem 0; }
  `],
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatIconModule
  ]
})
export class DashboardTestComponent implements OnInit {
  loading = false;
  testResult: any = null;
  estadisticas: any = null;
  actividadReciente: any[] = [];
  balanceUsuario: any = null;
  notificacionesPendientes: any = null;

  constructor(
    private gastoService: GastoService,
    private grupoService: GrupoService,
    private balanceService: BalanceService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.probarEstadisticas();
  }

  probarEstadisticas(): void {
    this.loading = true;
    this.testResult = null;

    Promise.all([
      this.grupoService.obtenerGrupos().toPromise(),
      this.gastoService.obtenerRecientes(20).toPromise()
    ]).then(([grupos, gastos]) => {
      const gruposData = Array.isArray(grupos) ? grupos : (grupos?.data || []);
      const gastosData = gastos?.data || [];

      this.estadisticas = {
        totalGrupos: gruposData.length,
        totalGastos: gastosData.length,
        montoTotal: gastosData.reduce((sum, g) => sum + (g.monto || 0), 0)
      };

      this.testResult = {
        success: true,
        operation: 'cargarEstadisticas',
        data: this.estadisticas,
        timestamp: new Date().toISOString()
      };
      
      this.loading = false;
      console.log('✅ Estadísticas:', this.estadisticas);
    }).catch(error => {
      this.testResult = {
        success: false,
        operation: 'cargarEstadisticas',
        error: error,
        timestamp: new Date().toISOString()
      };
      this.loading = false;
      console.error('❌ Error:', error);
    });
  }

  probarActividad(): void {
    this.loading = true;
    this.testResult = null;

    interface ActividadRecienteItem {
      tipo: string;
      descripcion: string;
      fecha: Date;
      monto: number;
    }

    // Elimina la interfaz GastoResponse, ya que no es necesaria.

    this.gastoService.obtenerRecientes(5).subscribe(
      (response) => {
        this.actividadReciente = (response.data || []).map((gasto: any): ActividadRecienteItem => ({
          tipo: 'gasto',
          descripcion: gasto.descripcion,
          fecha: new Date(gasto.fechaGasto),
          monto: gasto.monto
        }));

        this.testResult = {
          success: true,
          operation: 'probarActividad',
          count: this.actividadReciente.length,
          data: this.actividadReciente,
          timestamp: new Date().toISOString()
        };
        
        this.loading = false;
        console.log('✅ Actividad:', this.actividadReciente);
      },
      (error: any) => {
        this.testResult = {
          success: false,
          operation: 'probarActividad',
          error: error,
          timestamp: new Date().toISOString()
        };
        this.loading = false;
        console.error('❌ Error:', error);
      }
    );
  }

  probarBalanceUsuario(): void {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const idUsuario = usuario.idUsuario;
    if (!idUsuario) {
      this.balanceUsuario = { error: 'Usuario no autenticado' };
      return;
    }
    this.balanceService.obtenerBalanceUsuario(idUsuario).subscribe({
      next: (response) => {
        this.balanceUsuario = response;
        console.log('✅ Balance usuario:', response);
      },
      error: (error) => {
        this.balanceUsuario = { error };
        console.error('❌ Error balance usuario:', error);
      }
    });
  }

  probarNotificacionesPendientes(): void {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const idUsuario = usuario.idUsuario;
    if (!idUsuario) {
      this.notificacionesPendientes = { error: 'Usuario no autenticado' };
      return;
    }
    this.notificacionService.obtenerPendientes(idUsuario).subscribe({
      next: (response) => {
        this.notificacionesPendientes = response;
        console.log('✅ Notificaciones pendientes:', response);
      },
      error: (error) => {
        this.notificacionesPendientes = { error };
        console.error('❌ Error notificaciones pendientes:', error);
      }
    });
  }
}