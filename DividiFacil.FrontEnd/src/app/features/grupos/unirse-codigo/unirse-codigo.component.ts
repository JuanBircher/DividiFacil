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
import { GrupoDto } from '../../../core/models/grupo.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

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
    MatInputModule,
    MatProgressSpinnerModule,
    CardComponent
  ]
})
export class UnirseCodigoComponent implements OnInit {
  codigoForm: FormGroup;
  buscando = false;
  grupoEncontrado: GrupoDto | null = null;
  errorBusqueda: string | null = null;

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
   * 🎨 FORMATEAR CÓDIGO MIENTRAS ESCRIBE
   */
  onCodigoInput(event: Event): void {
    let valor = (event.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (valor.length > 8) {
      valor = valor.substring(0, 8);
    }
    this.codigoForm.get('codigo')?.setValue(valor, { emitEvent: false });
  }

  /**
   * 🔍 BUSCAR GRUPO POR CÓDIGO
   */
  buscarGrupoPorCodigo(): void {
    this.errorBusqueda = null;
    this.grupoEncontrado = null;
    if (this.codigoForm.invalid) {
      this.codigoForm.markAllAsTouched();
      return;
    }
    const codigo = this.codigoForm.value.codigo;
    this.buscando = true;
    this.grupoService.obtenerGrupoPorCodigo(codigo).subscribe({
      next: (response) => {
        this.buscando = false;
        if (response.exito && response.data) {
          this.grupoEncontrado = response.data;
        } else {
          this.errorBusqueda = response.mensaje || 'No se encontró el grupo con ese código';
        }
      },
      error: (err) => {
        this.buscando = false;
        this.errorBusqueda = 'Error al buscar grupo';
      }
    });
  }

  /**
   * 🎯 UNIRSE AL GRUPO
   */
  unirseAlGrupo(): void {
    if (!this.grupoEncontrado) return;
    this.router.navigate(['/grupos/detalle', this.grupoEncontrado.idGrupo]);
  }

  /**
   * ❌ LIMPIAR BUSQUEDA
   */
  limpiarBusqueda(): void {
    this.codigoForm.reset();
    this.grupoEncontrado = null;
    this.errorBusqueda = null;
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