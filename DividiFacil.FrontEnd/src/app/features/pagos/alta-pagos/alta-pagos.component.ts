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

// Services y Models - USANDO TUS SERVICIOS REALES
import { PagoService } from '../../../core/services/pago.service';
import { GrupoService } from '../../../core/services/grupo.service';
import { PagoCreacionDto } from '../../../core/models/pago.model';
import { Grupo, MiembroGrupoSimpleDto } from '../../../core/models/grupo.model';
import { AuthService } from '../../../core/auth.service';
import { ApiResponse } from '../../../core/models/response.model';

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
    MatAutocompleteModule
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
  miembrosGrupo: MiembroGrupoSimpleDto[] = []; // ✅ CORRECTO: Usar el tipo que existe
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

    // ✅ CORRECTO: Usar getGrupos() que SÍ existe
    this.grupoService.getGrupos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Grupo[]>) => {
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
   * 👥 CUANDO SE SELECCIONA UN GRUPO - USANDO TU ESTRUCTURA REAL
   */
  onGrupoSeleccionado(): void {
    const idGrupo = this.pagoForm.get('idGrupo')?.value;
    if (!idGrupo) {
      this.miembrosGrupo = [];
      return;
    }

    // ✅ CORRECTO: obtenerMiembros devuelve GrupoConMiembrosDto
    this.grupoService.obtenerMiembros(idGrupo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.exito && response.data && response.data.miembros) {
            // ✅ CORRECTO: Acceder a miembros desde response.data.miembros
            this.miembrosGrupo = response.data.miembros.filter(
              (miembro: MiembroGrupoSimpleDto) => miembro.idUsuario !== this.usuarioActual?.idUsuario
            );
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
        next: (response: any) => {
          this.guardando = false;
          if (response.exito) {
            this.snackBar.open('¡Pago creado exitosamente!', 'Cerrar', { 
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            
            this.router.navigate(['/pagos'], {
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
      this.router.navigate(['/pagos'], {
        queryParams: { idGrupo: this.idGrupoPreseleccionado }
      });
    } else {
      this.router.navigate(['/pagos']);
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
   * 🎨 OBTENER NOMBRE DEL MIEMBRO - USANDO TU ESTRUCTURA REAL
   */
  obtenerNombreMiembro(idUsuario: string): string {
    const miembro = this.miembrosGrupo.find(m => m.idUsuario === idUsuario);
    return miembro?.nombreUsuario || ''; // ✅ CORRECTO: nombreUsuario según tu modelo
  }
}
