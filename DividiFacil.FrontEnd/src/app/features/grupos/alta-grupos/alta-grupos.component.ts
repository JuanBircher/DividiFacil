import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

// Servicios y Modelos
import { GrupoService } from '../../../core/services/grupo.service';
import { AuthService } from '../../../core/auth.service';
import { PlanHelperService } from '../../../core/helpers/plan-helper.service';
import { GrupoCreacionDto, ModoOperacion } from '../../../core/models/grupo.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-alta-grupos',
  standalone: true,
  templateUrl: './alta-grupos.component.html',
  styleUrls: ['./alta-grupos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    CardComponent,
    LoadingSpinnerComponent
  ]
})
export class AltaGruposComponent implements OnInit, OnDestroy {
  grupoForm: FormGroup;
  procesando = false;
  error: string | null = null;
  modoEdicion = false;
  idGrupo: string | null = null;
  loading = false;

  modosOperacion = [
    { value: ModoOperacion.ESTANDAR, label: 'Estándar', descripcion: 'Distribución básica' },
    { value: ModoOperacion.EQUITATIVO, label: 'Equitativo', descripcion: 'Todos pagan lo mismo' },
    { value: ModoOperacion.PROPORCIONAL, label: 'Proporcional', descripcion: 'Según ingresos' }
  ];

  private destroy$ = new Subject<void>();
  usuarioActual: any = null;
  gruposUsuario: any[] = [];
  limiteGruposFree = 1;
  superoLimite = false;

  constructor(
    private fb: FormBuilder,
    private grupoService: GrupoService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private planHelper: PlanHelperService
  ) {
    this.grupoForm = this.fb.group({
      NombreGrupo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      Descripcion: ['', [Validators.maxLength(200)]],
      ModoOperacion: [ModoOperacion.ESTANDAR, [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Obtener usuario actual y grupos
    this.authService.usuarioActual$.pipe(takeUntil(this.destroy$)).subscribe(usuario => {
      this.usuarioActual = usuario;
      if (usuario) {
        this.grupoService.obtenerGrupos().pipe(takeUntil(this.destroy$)).subscribe(response => {
          if (response.exito && response.data) {
            this.gruposUsuario = response.data;
            // Limitar solo si es Free
            if (this.planHelper.esFree(usuario) && this.gruposUsuario.length >= this.limiteGruposFree) {
              this.superoLimite = true;
            } else {
              this.superoLimite = false;
            }
            this.cdr.markForCheck();
          }
        });
      }
    });
    // Detectar si estamos en modo edición
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params: any) => {
      if (params['idGrupo']) {
        this.idGrupo = params['idGrupo'];
        this.modoEdicion = true;
        this.cargarGrupo();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarGrupo(): void {
    if (!this.idGrupo) return;

    this.procesando = true;
    this.cdr.markForCheck();

    this.grupoService.obtenerGrupo(this.idGrupo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.exito && response.data) {
            this.grupoForm.patchValue({
              NombreGrupo: response.data.nombreGrupo,
              Descripcion: response.data.descripcion,
              ModoOperacion: response.data.modoOperacion
            });
          }
          this.procesando = false;
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('❌ Error al cargar grupo:', error);
          this.error = 'Error al cargar el grupo';
          this.procesando = false;
          this.cdr.markForCheck();
        }
      });
  }

  submit(): void {
    if (this.grupoForm.invalid) {
      this.grupoForm.markAllAsTouched();
      return;
    }
    // Limitar creación para usuarios Free
    if (this.planHelper.esFree(this.usuarioActual) && this.gruposUsuario.length >= this.limiteGruposFree) {
      this.snackBar.open('Límite de grupos alcanzado para el plan Free. Actualiza tu plan para crear más grupos.', 'Cerrar', { duration: 4000 });
      return;
    }

    this.procesando = true;
    this.error = null;
    this.cdr.markForCheck();

    const grupoData: GrupoCreacionDto = {
      nombreGrupo: this.grupoForm.get('NombreGrupo')?.value,
      descripcion: this.grupoForm.get('Descripcion')?.value,
      modoOperacion: this.grupoForm.get('ModoOperacion')?.value
    };

    const operacion = this.modoEdicion 
      ? this.grupoService.actualizarGrupo(this.idGrupo!, grupoData)
      : this.grupoService.crearGrupo(grupoData);

    (operacion as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.exito) {
            const mensaje = this.modoEdicion ? 'Grupo actualizado exitosamente' : 'Grupo creado exitosamente';
            this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
            this.router.navigate(['/grupos']);
          } else {
            this.error = response.mensaje || 'Error al procesar la solicitud';
          }
          this.procesando = false;
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          console.error('❌ Error al procesar grupo:', error);
          this.error = 'Error al procesar el grupo. Intente nuevamente.';
          this.procesando = false;
          this.cdr.markForCheck();
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/grupos']);
  }

  // ✅ GETTER PARA FÁCIL ACCESO A CONTROLES
  get nombreGrupo() { return this.grupoForm.get('NombreGrupo'); }
  get descripcion() { return this.grupoForm.get('Descripcion'); }
  get modoOperacion() { return this.grupoForm.get('ModoOperacion'); }
}