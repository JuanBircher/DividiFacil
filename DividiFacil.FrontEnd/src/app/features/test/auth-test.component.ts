// Crear: src/app/features/test/auth-test.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-auth-test',
  standalone: true,
  template: `
    <div class="test-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>🧪 Pruebas de Autenticación</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Test de Login -->
          <div class="test-section">
            <h3>🔐 Test Login</h3>
            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput [(ngModel)]="loginEmail" value="probando@test.com">
            </mat-form-field>
            
            <mat-form-field>
              <mat-label>Password</mat-label>
              <input matInput type="password" [(ngModel)]="loginPassword" value="123456">
            </mat-form-field>
            
            <button mat-raised-button color="primary" (click)="testLogin()" [disabled]="loading">
              {{ loading ? 'Probando...' : 'Probar Login' }}
            </button>
          </div>

          <!-- Resultados -->
          <div class="results" *ngIf="testResult">
            <h3>📊 Resultados</h3>
            <pre>{{ testResult | json }}</pre>
          </div>

          <!-- Token Info -->
          <div class="token-info" *ngIf="tokenInfo">
            <h3>🔑 Información del Token</h3>
            <pre>{{ tokenInfo | json }}</pre>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .test-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
    }
    
    .test-section {
      margin-bottom: 2rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    
    mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }
    
    .results, .token-info {
      margin-top: 2rem;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 8px;
    }
    
    pre {
      font-size: 12px;
      overflow-x: auto;
    }
  `],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ]
})
export class AuthTestComponent {
  loginEmail = 'probando@test.com';
  loginPassword = '123456';
  loading = false;
  testResult: any = null;
  tokenInfo: any = null;

  constructor(private authService: AuthService) {}

  testLogin(): void {
    this.loading = true;
    this.testResult = null;
    this.tokenInfo = null;

    const credentials = {
      email: this.loginEmail,
      password: this.loginPassword
    };

    console.log('🧪 Probando login con:', credentials);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading = false;
        this.testResult = {
          success: true,
          response: response,
          timestamp: new Date().toISOString()
        };

        // Obtener info del token
        if (response.exito && response.data?.token) {
          this.tokenInfo = this.decodeToken(response.data.token);
        }

        console.log('✅ Login exitoso:', response);
      },
      error: (error) => {
        this.loading = false;
        this.testResult = {
          success: false,
          error: error,
          timestamp: new Date().toISOString()
        };
        console.error('❌ Error en login:', error);
      }
    });
  }

  private decodeToken(token: string): any {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        payload: payload,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        isExpired: Date.now() > (payload.exp * 1000)
      };
    } catch (error) {
      return { error: 'No se pudo decodificar el token' };
    }
  }
}