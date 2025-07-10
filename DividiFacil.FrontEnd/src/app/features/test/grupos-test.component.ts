// Crear: src/app/features/test/grupos-test.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GrupoService } from '../../core/services/grupo.service';
import { GrupoDto, GrupoCreacionDto } from '../../core/models/grupo.model';

@Component({
  selector: 'app-grupos-test',
  standalone: true,
  template: `
    <div class="test-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>🧪 Pruebas de Grupos</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="test-section">
            <h3>📋 Obtener Grupos</h3>
            <button mat-raised-button color="primary" (click)="probarObtenerGrupos()" [disabled]="loading">
              {{ loading ? 'Cargando...' : 'Probar Obtener Grupos' }}
            </button>
            
            <div *ngIf="grupos.length > 0" class="result">
              <h4>✅ Grupos encontrados: {{grupos.length}}</h4>
              <div *ngFor="let grupo of grupos" class="grupo-item">
                <strong>{{grupo.nombreGrupo}}</strong> - {{grupo.modoOperacion}} - {{grupo.cantidadMiembros}} miembros
              </div>
            </div>
          </div>
          
          <div class="test-section">
            <h3>➕ Crear Grupo</h3>
            <button mat-raised-button color="accent" (click)="probarCrearGrupo()" [disabled]="loading">
              {{ loading ? 'Creando...' : 'Crear Grupo de Prueba' }}
            </button>
          </div>
          
          <div class="results" *ngIf="testResult">
            <h3>📊 Último Resultado</h3>
            <pre>{{ testResult | json }}</pre>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .test-container { max-width: 800px; margin: 2rem auto; padding: 1rem; }
    .test-section { margin: 2rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
    .result { margin-top: 1rem; padding: 1rem; background: #f0f8ff; border-radius: 4px; }
    .grupo-item { padding: 0.5rem; border-bottom: 1px solid #eee; }
    .results { margin-top: 2rem; padding: 1rem; background: #f5f5f5; border-radius: 8px; }
    pre { font-size: 12px; overflow-x: auto; }
  `],
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule]
})
export class GruposTestComponent implements OnInit {
  grupos: GrupoDto[] = [];
  loading = false;
  testResult: any = null;

  constructor(private grupoService: GrupoService) {}

  ngOnInit(): void {
    this.probarObtenerGrupos();
  }

  probarObtenerGrupos(): void {
    this.loading = true;
    this.testResult = null;

    this.grupoService.obtenerGrupos().subscribe({
      next: (response) => {
        // 🔧 CORREGIR: Manejar ApiResponse correctamente
        this.grupos = response.exito ? (response.data ?? []) : [];
        this.testResult = {
          success: response.exito,
          operation: 'obtenerGrupos',
          count: this.grupos.length,
          data: this.grupos,
          timestamp: new Date().toISOString()
        };
        this.loading = false;
        console.log('✅ Grupos obtenidos:', this.grupos);
      },
      error: (error) => {
        this.testResult = {
          success: false,
          operation: 'obtenerGrupos',
          error: error,
          timestamp: new Date().toISOString()
        };
        this.loading = false;
        console.error('❌ Error:', error);
      }
    });
  }

  probarCrearGrupo(): void {
    this.loading = true;
    this.testResult = null;

    const grupoTest: GrupoCreacionDto = {
      nombreGrupo: `Grupo Test ${Date.now()}`,
      descripcion: 'Grupo creado para pruebas',
      modoOperacion: 'Equitativo' // Valor correcto según backend
    };

    this.grupoService.crearGrupo(grupoTest).subscribe({
      next: (response) => {
        this.testResult = {
          success: response.exito,
          operation: 'crearGrupo',
          response: response,
          timestamp: new Date().toISOString()
        };
        this.loading = false;
        console.log('✅ Grupo creado:', response);
        if (response.exito) {
          this.probarObtenerGrupos();
        }
      },
      error: (error) => {
        this.testResult = {
          success: false,
          operation: 'crearGrupo',
          error: error,
          timestamp: new Date().toISOString()
        };
        this.loading = false;
        console.error('❌ Error:', error);
      }
    });
  }
}