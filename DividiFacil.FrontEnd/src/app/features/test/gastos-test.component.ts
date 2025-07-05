// Crear: src/app/features/test/gastos-test.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { GastoService } from '../../core/services/gasto.service';
import { GastoDto, GastoCreacionDto } from '../../core/models/gasto.model';

@Component({
  selector: 'app-gastos-test',
  standalone: true,
  templateUrl: './gastos-test.component.html',
  styleUrls: ['./gastos-test.component.scss'], // 🔧 CORREGIR: styleUrls en lugar de stylesUrls
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatProgressSpinnerModule,
    MatExpansionModule
  ]
})
export class GastosTestComponent implements OnInit {
  gastosRecientes: GastoDto[] = [];
  saldos: any[] = [];
  loading = false;
  testResult: any = null;

  constructor(private gastoService: GastoService) {}

  ngOnInit(): void {
    this.probarGastosRecientes();
  }

  probarGastosRecientes(): void {
    this.loading = true;
    this.testResult = null;

    // Elimina la interface GastosRecientesResponse porque no es necesaria

    interface TestResultSuccess {
      success: true;
      operation: string;
      count: number;
      data: any;
      timestamp: string;
    }

    interface TestResultError {
      success: false;
      operation: string;
      error: any;
      timestamp: string;
    }

    this.gastoService.obtenerRecientes(5).subscribe({
      next: (response: { data?: GastoDto[]; [key: string]: any }) => {
        this.gastosRecientes = response.data ?? [];
        this.testResult = {
          success: true,
          operation: 'obtenerRecientes',
          count: this.gastosRecientes.length,
          data: response,
          timestamp: new Date().toISOString()
        } as TestResultSuccess;
        this.loading = false;
        console.log('✅ Gastos recientes:', this.gastosRecientes);
      },
      error: (error: any) => {
        this.testResult = {
          success: false,
          operation: 'obtenerRecientes',
          error: error,
          timestamp: new Date().toISOString()
        } as TestResultError;
        this.loading = false;
        console.error('❌ Error:', error);
      }
    });
  }

  probarSaldos(): void {
    this.loading = true;
    this.testResult = null;

    this.gastoService.obtenerSaldosUsuario().subscribe({
      next: (response) => {
        this.saldos = response.data || [];
        this.testResult = {
          success: true,
          operation: 'obtenerSaldosUsuario',
          count: this.saldos.length,
          data: response,
          timestamp: new Date().toISOString()
        };
        this.loading = false;
        console.log('✅ Saldos:', this.saldos);
      },
      error: (error) => {
        this.testResult = {
          success: false,
          operation: 'obtenerSaldosUsuario',
          error: error,
          timestamp: new Date().toISOString()
        };
        this.loading = false;
        console.error('❌ Error:', error);
      }
    });
  }
}