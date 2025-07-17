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
import { AuthService } from '../../../core/auth.service';
import { PlanHelperService } from '../../../core/helpers/plan-helper.service';
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

  usuarioActual: any = null;
  gruposUsuario: any[] = [];
  limiteGruposFree = 1;
  superoLimite = false;

  constructor(
    private fb: FormBuilder,
    private grupoService: GrupoService,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService,
    private planHelper: PlanHelperService
  ) {
    this.codigoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]]
    });
  }

  ngOnInit(): void {
    this.authService.usuarioActual$.subscribe(usuario => {
      this.usuarioActual = usuario;
      if (usuario) {
        this.grupoService.obtenerGrupos().subscribe(response => {
          if (response.exito && response.data) {
            this.gruposUsuario = response.data;
            if (this.planHelper.esFree(usuario) && this.gruposUsuario.length >= this.limiteGruposFree) {
              this.superoLimite = true;
            } else {
              this.superoLimite = false;
            }
          }
        });
      }
    });
  }

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
   * 🎯 UNIRSE AL GRUPO (agrega al usuario como miembro y navega al detalle)
   */
  unirseAlGrupo(): void {
    if (!this.grupoEncontrado) return;
    // Limitar unión para usuarios Free
    if (this.planHelper.esFree(this.usuarioActual) && this.gruposUsuario.length >= this.limiteGruposFree) {
      this.snackBar.open('Límite de grupos alcanzado para el plan Free. Actualiza tu plan para unirte a más grupos.', 'Cerrar', { duration: 4000 });
      return;
    }
    this.buscando = true;
    this.grupoService.agregarMiembro(this.grupoEncontrado.idGrupo, { emailInvitado: '' }).subscribe({
      next: (response) => {
        this.buscando = false;
        if (response.exito) {
          this.snackBar.open('¡Te has unido al grupo!', 'Cerrar', { duration: 2500 });
          this.router.navigate(['/grupos/detalle', this.grupoEncontrado!.idGrupo]);
        } else if (response.mensaje && response.mensaje.toLowerCase().includes('ya es miembro')) {
          // Si ya es miembro, navegar igual
          this.snackBar.open('Ya eres miembro del grupo', 'Cerrar', { duration: 2500 });
          this.router.navigate(['/grupos/detalle', this.grupoEncontrado!.idGrupo]);
        } else {
          this.snackBar.open(response.mensaje || 'No se pudo unir al grupo', 'Cerrar', { duration: 3500 });
        }
      },
      error: (err) => {
        this.buscando = false;
        this.snackBar.open('Error al intentar unirse al grupo', 'Cerrar', { duration: 3500 });
      }
    });
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