// src/app/features/test/api-test.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-api-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-container">
      <h2>🧪 Prueba de Conectividad API - DividiFacil</h2>
      <div class="config-info">
        <p><strong>API URL:</strong> {{ apiUrl }}</p>
        <p><strong>Usuario Test:</strong> 848811D7-F55D-455C-A787-696272EABFAE</p>
        <p><strong>Email:</strong> probando&#64;test.com</p>
      </div>
      
      <div class="auth-section">
        <h3>🔐 Autenticación</h3>
        <button (click)="testConexionBasica()" [disabled]="loading">Probar Conexión Básica</button>
        <button (click)="autenticarYProbar()" [disabled]="loading">Autenticar y Probar</button>
        <div *ngIf="token" class="token-info">✅ Token obtenido</div>
      </div>
      
      <div class="tests-grid">
        
        <div class="test-card">
          <h3>📁 Grupos</h3>
          <button (click)="testGrupos()" [disabled]="loading">Probar</button>
          <div [ngClass]="getStatusClass(resultadoGrupos)">{{ resultadoGrupos }}</div>
        </div>
        
        <div class="test-card">
          <h3>💰 Gastos</h3>
          <button (click)="testGastos()" [disabled]="loading">Probar</button>
          <div [ngClass]="getStatusClass(resultadoGastos)">{{ resultadoGastos }}</div>
        </div>
        
        <div class="test-card">
          <h3>🔔 Notificaciones</h3>
          <button (click)="testNotificaciones()" [disabled]="loading">Probar</button>
          <div [ngClass]="getStatusClass(resultadoNotificaciones)">{{ resultadoNotificaciones }}</div>
        </div>
        
        <div class="test-card">
          <h3>💳 Pagos</h3>
          <button (click)="testPagos()" [disabled]="loading">Probar</button>
          <div [ngClass]="getStatusClass(resultadoPagos)">{{ resultadoPagos }}</div>
        </div>
        
        <div class="test-card">
          <h3>🏦 Caja Común</h3>
          <button (click)="testCaja()" [disabled]="loading">Probar</button>
          <div [ngClass]="getStatusClass(resultadoCaja)">{{ resultadoCaja }}</div>
        </div>
        
        <div class="test-card full-width">
          <h3>🚀 Prueba Completa</h3>
          <button (click)="testTodos()" [disabled]="loading" class="test-all-btn">
            Probar Todos los Endpoints
          </button>
        </div>
        
      </div>
      
      <div *ngIf="ultimoError" class="error-section">
        <h4>❌ Último Error:</h4>
        <div class="error-details">
          <p><strong>Status:</strong> {{ ultimoError.status }} - {{ ultimoError.statusText }}</p>
          <p><strong>URL:</strong> {{ ultimoError.url }}</p>
          <p><strong>Mensaje:</strong> {{ ultimoError.message }}</p>
        </div>
        <pre>{{ ultimoError | json }}</pre>
      </div>
      
      <div *ngIf="ultimoExito" class="success-section">
        <h4>✅ Último Éxito:</h4>
        <pre>{{ ultimoExito | json }}</pre>
      </div>
      
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
    }
    .config-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .auth-section {
      background: #e8f5e8;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .tests-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .test-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      background: white;
    }
    .test-card.full-width {
      grid-column: 1 / -1;
      text-align: center;
    }
    .test-card h3 {
      margin-top: 0;
      color: #333;
    }
    .test-card button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      background: #2196F3;
      color: white;
      cursor: pointer;
      margin-bottom: 10px;
    }
    .test-all-btn {
      background: #4CAF50 !important;
      font-size: 16px !important;
      padding: 15px 30px !important;
    }
    .test-card button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .success { color: #4CAF50; font-weight: bold; }
    .error { color: #f44336; font-weight: bold; }
    .pending { color: #ff9800; font-weight: bold; }
    .error-section, .success-section {
      margin-top: 20px;
      padding: 15px;
      border-radius: 4px;
    }
    .error-section {
      background: #ffebee;
      border-left: 4px solid #f44336;
    }
    .success-section {
      background: #e8f5e8;
      border-left: 4px solid #4CAF50;
    }
    .error-details p {
      margin: 5px 0;
    }
    pre {
      background: #f8f8f8;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
    }
    .token-info {
      margin-top: 10px;
      color: #4CAF50;
      font-weight: bold;
    }
  `]
})
export class ApiTestComponent {
  apiUrl = environment.apiUrl;
  loading = false;
  
  resultadoGrupos = 'Sin probar';
  resultadoGastos = 'Sin probar';
  resultadoNotificaciones = 'Sin probar';
  resultadoPagos = 'Sin probar';
  resultadoCaja = 'Sin probar';
  
  ultimoError: any = null;
  ultimoExito: any = null;

  // Agregar después del constructor
  token: string | null = null;

  constructor(private http: HttpClient) {}

  getStatusClass(resultado: string): string {
    if (resultado.includes('✅')) return 'success';
    if (resultado.includes('❌')) return 'error';
    if (resultado.includes('⏳')) return 'pending';
    return '';
  }

  // Método para probar conexión básica (sin auth)
  testConexionBasica() {
    console.log('🔍 Probando conexión básica al servidor...');
    
    // Probar endpoint que no requiera autenticación (si existe)
    this.http.get(`${this.apiUrl}/health`).subscribe({
      next: (data) => {
        console.log('✅ Servidor conectado:', data);
      },
      error: (err) => {
        console.log('❌ Error de conexión:', err);
        // Si es 404, el servidor está funcionando pero no existe /health
        if (err.status === 404) {
          console.log('✅ Servidor funcionando (404 es normal para /health)');
        }
      }
    });
  }

  // Método para autenticarse primero
  async autenticarYProbar() {
    console.log('🔐 Intentando autenticación...');
    
    const credenciales = {
      email: 'probando@test.com',
      password: 'Test123!'  // Ajusta según tu sistema
    };

    try {
      const authResponse: any = await this.http.post(`${this.apiUrl}/auth/login`, credenciales).toPromise();
      
      if (authResponse && authResponse.token) {
        this.token = authResponse.token;
        console.log('✅ Autenticado correctamente');
        
        // Ahora probar endpoints con autenticación
        this.testGruposConAuth();
      }
    } catch (error) {
      console.error('❌ Error de autenticación:', error);
      this.ultimoError = error;
    }
  }

  // Método para probar grupos CON autenticación
  testGruposConAuth() {
    if (!this.token) {
      this.resultadoGrupos = '❌ No hay token de autenticación';
      return;
    }

    this.resultadoGrupos = '⏳ Probando con autenticación...';
    this.ultimoError = null;

    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };

    this.http.get(`${this.apiUrl}/grupos`, { headers }).subscribe({
      next: (data: any) => {
        const count = Array.isArray(data?.data) ? data.data.length : (data?.data ? 1 : 0);
        this.resultadoGrupos = `✅ ${count} grupos encontrados (autenticado)`;
        this.ultimoExito = data;
        console.log('✅ Grupos obtenidos:', data);
      },
      error: (err) => {
        this.resultadoGrupos = `❌ Error: ${err.status} - ${err.statusText}`;
        this.ultimoError = err;
        console.error('❌ Error grupos:', err);
      }
    });
  }

  testGrupos() {
    // Primero intentar sin auth para ver el error específico
    this.resultadoGrupos = '⏳ Probando sin autenticación...';
    this.ultimoError = null;
    
    this.http.get(`${this.apiUrl}/grupos`).subscribe({
      next: (data: any) => {
        const count = Array.isArray(data?.data) ? data.data.length : (data?.data ? 1 : 0);
        this.resultadoGrupos = `✅ ${count} grupos encontrados`;
        this.ultimoExito = data;
        console.log('✅ Grupos obtenidos:', data);
      },
      error: (err) => {
        if (err.status === 401) {
          this.resultadoGrupos = `🔐 Requiere autenticación (401)`;
          console.log('🔐 Endpoint requiere autenticación, probando login...');
          this.autenticarYProbar();
        } else {
          this.resultadoGrupos = `❌ Error: ${err.status} - ${err.statusText}`;
        }
        this.ultimoError = err;
        console.error('❌ Error grupos:', err);
      }
    });
  }

  testGastos() {
    this.resultadoGastos = '⏳ Probando conexión...';
    this.ultimoError = null;
    
    // CORRECCIÓN: Quitar /api/ del path
    this.http.get(`${this.apiUrl}/gastos`).subscribe({
      next: (data: any) => {
        const count = Array.isArray(data) ? data.length : (data?.data?.length || 0);
        this.resultadoGastos = `✅ ${count} gastos encontrados`;
        this.ultimoExito = data;
        console.log('✅ Gastos obtenidos:', data);
      },
      error: (err) => {
        this.resultadoGastos = `❌ Error: ${err.status || 'Sin conexión'}`;
        this.ultimoError = err;
        console.error('❌ Error gastos:', err);
      }
    });
  }

  testNotificaciones() {
    this.resultadoNotificaciones = '⏳ Probando conexión...';
    this.ultimoError = null;
    
    // CORRECCIÓN: Quitar /api/ del path
    this.http.get(`${this.apiUrl}/notificaciones`).subscribe({
      next: (data: any) => {
        const count = Array.isArray(data) ? data.length : (data?.data?.length || 0);
        this.resultadoNotificaciones = `✅ ${count} notificaciones encontradas`;
        this.ultimoExito = data;
        console.log('✅ Notificaciones obtenidas:', data);
      },
      error: (err) => {
        this.resultadoNotificaciones = `❌ Error: ${err.status || 'Sin conexión'}`;
        this.ultimoError = err;
        console.error('❌ Error notificaciones:', err);
      }
    });
  }

  testPagos() {
    this.resultadoPagos = '⏳ Probando conexión...';
    this.ultimoError = null;
    
    // CORRECCIÓN: Quitar /api/ del path
    this.http.get(`${this.apiUrl}/pagos`).subscribe({
      next: (data: any) => {
        const count = Array.isArray(data) ? data.length : (data?.data?.length || 0);
        this.resultadoPagos = `✅ ${count} pagos encontrados`;
        this.ultimoExito = data;
        console.log('✅ Pagos obtenidos:', data);
      },
      error: (err) => {
        this.resultadoPagos = `❌ Error: ${err.status || 'Sin conexión'}`;
        this.ultimoError = err;
        console.error('❌ Error pagos:', err);
      }
    });
  }

  testCaja() {
    this.resultadoCaja = '⏳ Probando conexión...';
    this.ultimoError = null;
    
    // CORRECCIÓN: Quitar /api/ del path
    this.http.get(`${this.apiUrl}/caja`).subscribe({
      next: (data: any) => {
        const count = Array.isArray(data) ? data.length : (data?.data?.length || 0);
        this.resultadoCaja = `✅ ${count} cajas encontradas`;
        this.ultimoExito = data;
        console.log('✅ Cajas obtenidas:', data);
      },
      error: (err) => {
        this.resultadoCaja = `❌ Error: ${err.status || 'Sin conexión'}`;
        this.ultimoError = err;
        console.error('❌ Error caja:', err);
      }
    });
  }

  testTodos() {
    this.loading = true;
    const tests = [
      () => this.testGrupos(),
      () => this.testGastos(),
      () => this.testNotificaciones(),
      () => this.testPagos(),
      () => this.testCaja()
    ];

    tests.forEach((test, index) => {
      setTimeout(() => {
        test();
        if (index === tests.length - 1) {
          this.loading = false;
        }
      }, index * 500);
    });
  }

  testEndpointsBasicos() {
    console.log('🔍 Probando endpoints básicos...');
    
    const endpoints = [
      '/grupos',
      '/gastos', 
      '/pagos',
      '/notificaciones',
      '/caja',
      '/usuarios',
      '/auth/login'
    ];

    endpoints.forEach(endpoint => {
      this.http.get(`${this.apiUrl}${endpoint}`).subscribe({
        next: (data) => {
          console.log(`✅ ${endpoint} - Funciona:`, data);
        },
        error: (err) => {
          console.log(`❌ ${endpoint} - Error ${err.status}:`, err.statusText);
        }
      });
    });
  }
}