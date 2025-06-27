import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { RegisterRequest } from '../../../core/models/register-request.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ]
})
export class RegisterComponent {
  error: string | null = null;
  loading = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      confirmarPassword: ['', [Validators.required]],
      telefono: ['']
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmarPassword')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
  }

  onSubmit() {
    this.error = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const registerRequest: RegisterRequest = {
      nombre: this.form.value.nombre,
      email: this.form.value.email,
      password: this.form.value.password,
      confirmarPassword: this.form.value.confirmarPassword,
      telefono: this.form.value.telefono
    };

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.exito) {
          this.router.navigate(['/auth/login'], { queryParams: { registered: true } });
        } else {
          this.error = response.mensaje || 'Error en el registro. Intenta de nuevo.';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.message || 'Error en el registro. Intenta de nuevo.';
      }
    });
  }
}