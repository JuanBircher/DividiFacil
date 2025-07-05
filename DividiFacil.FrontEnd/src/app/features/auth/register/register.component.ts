import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
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
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
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
export class RegisterComponent implements OnInit {
  error: string | null = null;
  loading = false;
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''], // Opcional
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', Validators.required]
    }, { 
      validators: this.passwordsMatchValidator 
    });
  }

  ngOnInit(): void {
    // Si ya está logueado, redirigir al dashboard
    if (this.authService.estaLogueado()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * 🎓 EXPLICACIÓN: Validador personalizado para verificar que las contraseñas coincidan
   * Este validador se ejecuta cada vez que cambias cualquier campo del formulario
   */
  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmarPassword')?.value;
    
    // Si las contraseñas no coinciden, devolvemos un error
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  onSubmit(): void {
    this.error = null;
    
    // Si el formulario no es válido, marcar todos los campos como tocados para mostrar errores
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    // Preparar los datos para el backend (según tu AuthService)
    const registerRequest = {
      nombre: this.registerForm.value.nombre,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      confirmarPassword: this.registerForm.value.confirmarPassword,
      telefono: this.registerForm.value.telefono || undefined // Solo enviar si tiene valor
    };

    /**
     * 🎓 EXPLICACIÓN: Llamamos al método register de tu AuthService
     * Tu AuthService ya maneja el token y redirección automáticamente
     */
    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.exito) {
          // ✅ Tu AuthService ya guarda el token y usuario automáticamente
          this.router.navigate(['/dashboard']);
        } else {
          this.error = response.mensaje || 'Error al crear la cuenta';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Ha ocurrido un error inesperado';
        console.error('Error en registro:', err);
      }
    });
  }
}