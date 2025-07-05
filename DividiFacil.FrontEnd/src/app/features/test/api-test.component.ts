import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { GrupoService } from '../../core/services/grupo.service';
import { GastoService } from '../../core/services/gasto.service';
import { PagoService } from '../../core/services/pago.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { environment } from '../../../environments/environment';

interface TestResult {
  success: boolean;
  data: any;
}

interface LoginCredentials {
  email: string;
  password: string;
}

@Component({
  selector: 'app-api-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './api-test.component.html',
  styleUrls: ['./api-test.component.scss']
})
export class ApiTestComponent implements OnInit {

  // ✅ PROPIEDADES AGREGADAS
  authTestResult: TestResult | null = null;
  gruposTestResult: TestResult | null = null;
  gastosTestResult: TestResult | null = null;
  pagosTestResult: TestResult | null = null;
  notificacionesTestResult: TestResult | null = null;
  public environment = environment;


  loading = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService, // ✅ INYECCIÓN CORREGIDA
    private grupoService: GrupoService,
    private gastoService: GastoService,
    private pagoService: PagoService,
    private notificacionService: NotificacionService,

  ) { }

  ngOnInit() {
    console.log('🔗 URL Base configurada:', environment.apiUrl);
    console.log('🔑 Token actual:', localStorage.getItem('token'));
  }

  // ✅ MÉTODO CORREGIDO
  testAuthentication() {
    this.loading = true;
    this.authTestResult = null;

    const credentials: LoginCredentials = {
      email: 'probando@test.com',
      password: '123456'
    };

    this.authService.login(credentials).subscribe({
      next: (response: any) => {
        console.log('✅ Login exitoso:', response);
        this.authTestResult = { success: true, data: response };
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Error de autenticación:', error);
        this.authTestResult = { success: false, data: error };
        this.loading = false;
      }
    });
  }

  // ✅ MÉTODO PARA PROBAR GRUPOS
  testGrupos() {
    this.loading = true;
    this.gruposTestResult = null;

    this.grupoService.getGrupos().subscribe({
      next: (response: any) => {
        console.log('✅ Grupos obtenidos:', response);
        this.gruposTestResult = { success: true, data: response };
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Error obteniendo grupos:', error);
        this.gruposTestResult = { success: false, data: error };
        this.loading = false;
      }
    });
  }

  // ✅ MÉTODO PARA PROBAR GASTOS
  testGastos() {
    this.loading = true;
    this.gastosTestResult = null;

    this.gastoService.obtenerMisGastos().subscribe({
      next: (response: any) => {
        console.log('✅ Gastos obtenidos:', response);
        this.gastosTestResult = { success: true, data: response };
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Error obteniendo gastos:', error);
        this.gastosTestResult = { success: false, data: error };
        this.loading = false;
      }
    });
  }

  // ✅ MÉTODO PARA PROBAR PAGOS
  testPagos() {
    this.loading = true;
    this.pagosTestResult = null;

    this.pagoService.obtenerPagosRealizados().subscribe({
      next: (response: any) => {
        console.log('✅ Pagos obtenidos:', response);
        this.pagosTestResult = { success: true, data: response };
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Error obteniendo pagos:', error);
        this.pagosTestResult = { success: false, data: error };
        this.loading = false;
      }
    });
  }

  // ✅ MÉTODO PARA PROBAR NOTIFICACIONES
  testNotificaciones() {
    this.loading = true;
    this.notificacionesTestResult = null;

    this.notificacionService.obtenerPendientes().subscribe({
      next: (response: any) => {
        console.log('✅ Notificaciones obtenidas:', response);
        this.notificacionesTestResult = { success: true, data: response };
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Error obteniendo notificaciones:', error);
        this.notificacionesTestResult = { success: false, data: error };
        this.loading = false;
      }
    });
  }

  // ✅ MÉTODO PARA PROBAR TODOS LOS ENDPOINTS
  testAllEndpoints() {
    console.log('🧪 Iniciando pruebas de todos los endpoints...');
    this.testAuthentication();

    // Esperar un poco antes de probar los otros endpoints
    setTimeout(() => {
      this.testGrupos();
      this.testGastos();
      this.testPagos();
      this.testNotificaciones();
    }, 2000);
  }

  // ✅ MÉTODO PARA LIMPIAR RESULTADOS
  clearResults() {
    this.authTestResult = null;
    this.gruposTestResult = null;
    this.gastosTestResult = null;
    this.pagosTestResult = null;
    this.notificacionesTestResult = null;
  }

  // ✅ MÉTODO PARA OBTENER INFO DEL TOKEN
  getTokenInfo() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔑 Token payload:', payload);
        return payload;
      } catch (error) {
        console.error('❌ Error decodificando token:', error);
        return null;
      }
    }
    return null;
  }

  // ✅ MÉTODO PARA PROBAR ALINEACIÓN COMPLETA
  testCompleteAlignment(): void {
    console.log('🔍 INICIANDO PRUEBA DE ALINEACIÓN COMPLETA...');
    
    // 1. Probar carga de grupos
    this.testGrupos();
    
    // 2. Probar navegación
    setTimeout(() => {
      this.testNavigation();
    }, 2000);
    
    // 3. Probar modelos
    setTimeout(() => {
      this.testModels();
    }, 4000);
  }

  private testNavigation(): void {
    console.log('🧪 Probando navegación...');
    
    // Simular navegación
    const testRoutes = [
      '/grupos',
      '/grupos/alta',
      '/grupos/detalle/123',
      '/gastos?grupo=123',
      '/balances/grupo/123',
      '/pagos?idGrupo=123'
    ];
    
    testRoutes.forEach(route => {
      console.log(`🔗 Ruta: ${route}`);
    });
  }

  private testModels(): void {
    console.log('🧪 Probando modelos...');
    
    // Simular estructura de datos
    const grupoMock = {
      idGrupo: '123',
      nombreGrupo: 'Grupo Test',
      descripcion: 'Descripción test',
      cantidadMiembros: 5,
      totalGastos: 1500.50,
      fechaCreacion: new Date().toISOString(),
      modoOperacion: 'EQUITATIVO'
    };
    
    console.log('📋 Estructura esperada del grupo:', grupoMock);
  }
}