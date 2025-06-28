import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ]
})
export class RecoverPasswordComponent {
  form: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private snack: MatSnackBar) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    // Simulación de petición HTTP
    setTimeout(() => {
      this.loading = false;
      this.snack.open('Si el email existe, recibirás instrucciones para recuperar tu contraseña.', 'Cerrar', { duration: 5000 });
      this.form.reset();
    }, 1300);
  }
}