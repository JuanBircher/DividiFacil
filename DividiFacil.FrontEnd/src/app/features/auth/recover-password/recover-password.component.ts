import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

// Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ]
})
export class RecoverPasswordComponent implements OnInit {
  error: string | null = null;
  success: string | null = null;
  loading = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Si ya está logueado, redirigir al dashboard
    if (this.authService.estaLogueado()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    this.error = null;
    this.success = null;
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    /**
     * 🎓 EXPLICACIÓN: Por ahora simulamos la funcionalidad
     * Cuando tu backend tenga el endpoint de recuperación, simplemente
     * cambiaremos esto por una llamada real al AuthService
     */
    setTimeout(() => {
      this.loading = false;
      this.success = 'Se ha enviado un enlace de recuperación a tu email';
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 3000);
    }, 2000);

    /* 
    TODO: Implementar cuando el backend tenga el endpoint
    const recoverRequest = { email: this.form.value.email };
    
    this.authService.recoverPassword(recoverRequest).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.exito) {
          this.success = 'Se ha enviado un enlace de recuperación a tu email';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        } else {
          this.error = response.mensaje || 'Error al solicitar recuperación';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Ha ocurrido un error inesperado';
      }
    });
    */
  }
}