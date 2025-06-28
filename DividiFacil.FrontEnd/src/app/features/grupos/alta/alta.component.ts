import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GrupoService } from '../../../core/services/grupo.services';
import { Router } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-alta-grupo',
  templateUrl: './alta.component.html',
  styleUrls: ['./alta.component.scss'],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
  ]
})
export class AltaComponent {
  grupoForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private grupoService: GrupoService,
    private router: Router,
  ) {
    this.grupoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(200)]],
    });
  }

  submit() {
    if (this.grupoForm.invalid) {
      this.grupoForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;

    this.grupoService.crearGrupo(this.grupoForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']); // Cambia destino si quieres otra ruta post-alta
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Error al crear grupo';
      }
    });
  }
}