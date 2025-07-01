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
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule
  ]
})
export class LoginComponent implements OnInit {
  error: string | null = null;
  loading = false;
  form: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Si ya está logueado, redirigir al dashboard
    if (this.authService.estaLogueado()) {
      this.router.navigate(['/dashboard']);
    }

    // Cargar email recordado si existe
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.form.get('email')?.setValue(rememberedEmail);
      this.form.get('rememberMe')?.setValue(true);
    }
  }

  onSubmit(): void {
    this.error = null;
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const loginRequest = {
      email: this.form.value.email || '',
      password: this.form.value.password || ''
    };

    // Manejar "Recordarme"
    if (this.form.value.rememberMe) {
      localStorage.setItem('rememberedEmail', loginRequest.email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.exito) {
          // ✅ Redirigir al dashboard como ya tienes configurado
          this.router.navigate(['/dashboard']);
        } else {
          this.error = response.mensaje || 'Error al iniciar sesión';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Ha ocurrido un error inesperado';
        console.error('Error en login:', err);
      }
    });
  }

  // Método para manejar Enter en el formulario
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.form.valid && !this.loading) {
      this.onSubmit();
    }
  }
}