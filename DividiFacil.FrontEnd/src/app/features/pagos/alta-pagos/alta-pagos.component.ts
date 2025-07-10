import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

// Services y Models - CORREGIDOS
import { PagoService, PagoCreacionDto } from '../../../core/services/pago.service';
import { GrupoService } from '../../../core/services/grupo.service';
import { Grupo } from '../../../core/models/grupo.model';
import { AuthService } from '../../../core/auth.service';
import { ResponseDto } from '../../../core/models/response.model';
import { MiembroGrupoDto } from '../../../core/models/miembro.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-alta-pagos',
  standalone: true,
  templateUrl: './alta-pagos.component.html',
  styleUrls: ['./alta-pagos.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    CardComponent,
    LoadingSpinnerComponent
  ]
})
export class AltaPagosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estados
  loading = false;
  guardando = false;

  // Datos
  pagoForm: FormGroup;
  gruposDisponibles: Grupo[] = [];
  miembrosGrupo: MiembroGrupoDto[] = [];
  usuarioActual: any;

  // Filtros
  idGrupoPreseleccionado = '';

  constructor(
    private fb: FormBuilder,
    private pagoService: PagoService,
    private grupoService: GrupoService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.pagoForm = this.fb.group({
      idGrupo: ['', Validators.required],
      idReceptor: ['', Validators.required],
      monto: ['', [Validators.required, Validators.min(0.01)]],
      concepto: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuario();

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.idGrupoPreseleccionado = params['idGrupo'] || '';
        this.cargarGrupos();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🔄 CARGAR GRUPOS - USANDO TU MÉTODO REAL
   */
  cargarGrupos(): void {
    this.loading = true;

    this.grupoService.getGrupos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ResponseDto<Grupo[]>) => {
          this.loading = false;
          if (response.exito && response.data) {
            this.gruposDisponibles = response.data;

            if (this.idGrupoPreseleccionado) {
              this.pagoForm.patchValue({ idGrupo: this.idGrupoPreseleccionado });
              this.onGrupoSeleccionado();
            }
          }
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error al cargar grupos:', err);
          this.snackBar.open('Error al cargar grupos', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * 👥 CUANDO SE SELECCIONA UN GRUPO - CORREGIDO
   */
  onGrupoSeleccionado(): void {
    const idGrupo = this.pagoForm.get('idGrupo')?.value;
    if (!idGrupo) {
      this.miembrosGrupo = [];
      return;
    }

    this.grupoService.obtenerMiembros(idGrupo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ResponseDto<any>) => {
          if (response.exito && response.data) {
            this.miembrosGrupo = (response.data.miembros || [])
              .filter((miembro: MiembroGrupoDto) => miembro.idUsuario !== this.usuarioActual?.idUsuario);
          }
        },
        error: (err: any) => {
          console.error('Error al cargar miembros:', err);
          this.snackBar.open('Error al cargar miembros del grupo', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * 💾 CREAR PAGO
   */
  crearPago(): void {
    if (!this.pagoForm.valid) return;

    this.guardando = true;

    const pagoData: PagoCreacionDto = {
      idGrupo: this.pagoForm.get('idGrupo')?.value,
      idReceptor: this.pagoForm.get('idReceptor')?.value,
      monto: Number(this.pagoForm.get('monto')?.value),
      concepto: this.pagoForm.get('concepto')?.value
    };

    this.pagoService.crearPago(pagoData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ResponseDto<any>) => {
          this.guardando = false;
          if (response.exito) {
            this.snackBar.open('¡Pago creado exitosamente!', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });

            // Navegar a listado-pagos
            this.router.navigate(['/listado-pagos'], {
              queryParams: { idGrupo: pagoData.idGrupo }
            });
          } else {
            this.snackBar.open('Error al crear pago', 'Cerrar', { duration: 3000 });
          }
        },
        error: (err: any) => {
          this.guardando = false;
          console.error('Error al crear pago:', err);
          this.snackBar.open('Error al crear pago', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * 🔙 CANCELAR
   */
  cancelar(): void {
    if (this.idGrupoPreseleccionado) {
      this.router.navigate(['/listado-pagos'], {
        queryParams: { idGrupo: this.idGrupoPreseleccionado }
      });
    } else {
      this.router.navigate(['/listado-pagos']);
    }
  }

  /**
   * 🎨 OBTENER NOMBRE DEL GRUPO
   */
  obtenerNombreGrupo(idGrupo: string): string {
    const grupo = this.gruposDisponibles.find(g => g.idGrupo === idGrupo);
    return grupo?.nombreGrupo || '';
  }

  /**
   * 🎨 OBTENER NOMBRE DEL MIEMBRO - CORREGIDO
   */
  obtenerNombreMiembro(idUsuario: string): string {
    const miembro = this.miembrosGrupo.find(m => m.idUsuario === idUsuario);
    return miembro?.nombre || '';
  }
}
