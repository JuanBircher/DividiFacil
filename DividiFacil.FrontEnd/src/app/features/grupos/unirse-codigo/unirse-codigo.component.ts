import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { GrupoService } from '../../../core/services/grupo.service';
import { Grupo } from '../../../core/models/grupo.model';

@Component({
  selector: 'app-unirse-codigo',
  standalone: true,
  templateUrl: './unirse-codigo.component.html',
  styleUrls: ['./unirse-codigo.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class UnirseCodiceComponent implements OnInit {
  codigoForm: FormGroup;
  buscando = false;
  grupoEncontrado: Grupo | null = null;
  uniendose = false;

  constructor(
    private fb: FormBuilder,
    private grupoService: GrupoService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.codigoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]]
    });
  }

  ngOnInit(): void {}

  /**
   * 🔍 BUSCAR GRUPO POR CÓDIGO
   */
  buscarGrupo(): void {
    if (this.codigoForm.invalid) return;

    this.buscando = true;
    this.grupoEncontrado = null;

    const codigo = this.codigoForm.get('codigo')?.value.toUpperCase();

    this.grupoService.buscarPorCodigo(codigo)
      .subscribe({
        next: (response) => {
          this.buscando = false;
          if (response.exito && response.data) {
            this.grupoEncontrado = response.data;
          } else {
            this.snackBar.open(response.mensaje || 'Código no válido', 'Cerrar', { duration: 3000 });
          }
        },
        error: (err) => {
          this.buscando = false;
          this.snackBar.open('Error al buscar grupo', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * 🤝 UNIRSE AL GRUPO
   */
  unirseAlGrupo(): void {
    if (!this.grupoEncontrado) return;

    this.uniendose = true;

    // Implementar lógica de unirse (puede requerir endpoint adicional en backend)
    // Por ahora, redirigir al grupo
    this.router.navigate(['/grupos/detalle', this.grupoEncontrado.idGrupo]);
  }

  /**
   * 🔄 LIMPIAR BÚSQUEDA
   */
  limpiarBusqueda(): void {
    this.codigoForm.reset();
    this.grupoEncontrado = null;
  }

  /**
   * 🎨 FORMATEAR CÓDIGO MIENTRAS ESCRIBE
   */
  onCodigoInput(event: any): void {
    let valor = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (valor.length > 8) {
      valor = valor.substring(0, 8);
    }
    this.codigoForm.get('codigo')?.setValue(valor, { emitEvent: false });
  }

  /**
   * 🎯 OBTENER MENSAJE DE ERROR
   */
  getErrorMessage(): string {
    const control = this.codigoForm.get('codigo');
    
    if (control?.hasError('required')) {
      return 'El código es obligatorio';
    }
    
    if (control?.hasError('minlength') || control?.hasError('maxlength')) {
      return 'El código debe tener exactamente 8 caracteres';
    }
    
    return '';
  }
}