import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GrupoService, GrupoCreacionDto } from '../../../core/services/grupo.services';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alta-grupo',
  standalone: true,
  templateUrl: './alta.component.html',
  styleUrls: ['./alta.component.scss'],
  imports: [
    CommonModule,
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
      NombreGrupo: ['', [Validators.required, Validators.maxLength(50)]],
      Descripcion: ['', [Validators.maxLength(200)]],
      ModoOperacion: ['Estandar']
    });
  }

  submit() {
    if (this.grupoForm.invalid) {
      this.grupoForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;

    const grupo: GrupoCreacionDto = this.grupoForm.value;
    this.grupoService.crearGrupo(this.grupoForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/grupos']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Error al crear grupo';
      }
    });
  }
}