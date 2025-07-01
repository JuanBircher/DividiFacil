import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GrupoCreacionDto } from '../../../core/models/grupo.model';
import { GrupoService } from '../../../core/services/grupo.service';
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
      nombreGrupo: ['', [Validators.required, Validators.minLength(3)]],    // ✅ camelCase
      descripcion: [''],                                                   // ✅ camelCase
      modoOperacion: ['', Validators.required]                             // ✅ camelCase
    });
  }

  crearGrupo() {
    if (this.grupoForm.valid) {
      const grupoData: GrupoCreacionDto = {
        nombreGrupo: this.grupoForm.get('nombreGrupo')?.value,      // ✅ camelCase
        descripcion: this.grupoForm.get('descripcion')?.value,      // ✅ camelCase
        modoOperacion: this.grupoForm.get('modoOperacion')?.value   // ✅ camelCase
      };
      
      this.grupoService.crearGrupo(grupoData).subscribe({
        next: (response) => {
          if (response.exito) {
            this.router.navigate(['/grupos']);
          }
        },
        error: (error) => {
          console.error('Error al crear grupo:', error);
        }
      });
    }
  }
}