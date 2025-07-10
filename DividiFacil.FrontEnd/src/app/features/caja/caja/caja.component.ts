import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Services y Models
import { CajaComunService } from '../../../core/services/caja-comun.service';
import { GrupoService } from '../../../core/services/grupo.service';
import { CajaComunDto, MovimientoCajaDto, MovimientoCajaCreacionDto } from '../../../core/models/caja-comun.model';
import { Grupo } from '../../../core/models/grupo.model';  
import { AuthService } from '../../../core/auth.service';

// Pipes
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-caja',
  standalone: true,
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CurrencyFormatPipe,
    DateFormatPipe,
    CardComponent,
    LoadingSpinnerComponent
  ]
})
export class CajaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estados
  loading = false;
  guardando = false;
  idGrupo = '';
  
  // Datos
  caja: CajaComunDto | null = null;
  grupo: Grupo | null = null; 
  movimientos: MovimientoCajaDto[] = [];
  
  // Formularios
  movimientoForm: FormGroup;
  filtrosForm: FormGroup;
  
  // UI
  mostrarFormulario = false;
  displayedColumns = ['fecha', 'concepto', 'tipo', 'monto', 'usuario', 'saldo', 'acciones'];
  
  // Permisos
  permisos = {
    puedeIngresar: false,
    puedeRetirar: false
  };

  usuarioActual: any;

  constructor(
    private fb: FormBuilder,
    private cajaService: CajaComunService,
    private grupoService: GrupoService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    this.movimientoForm = this.fb.group({
      tipoMovimiento: ['INGRESO', Validators.required],
      concepto: ['', [Validators.required, Validators.minLength(3)]],
      monto: [0, [Validators.required, Validators.min(0.01)]]
    });

    this.filtrosForm = this.fb.group({
      tipoMovimiento: [''],
      fechaDesde: [''],
      fechaHasta: ['']
    });
  }

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuario();
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.idGrupo = params['grupo'];
        if (this.idGrupo) {
          this.cargarDatos();
        } else {
          this.router.navigate(['/grupos']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🔄 CARGAR TODOS LOS DATOS
   */
  async cargarDatos(): Promise<void> {
    this.loading = true;
    try {
      const [cajaResponse, grupoResponse] = await Promise.all([
        this.cajaService.obtenerCajaPorGrupo(this.idGrupo, this.usuarioActual.idUsuario).toPromise(),
        this.grupoService.getGrupos().toPromise()
      ]);

      // Grupo - Buscar el grupo correspondiente por idGrupo
      if (grupoResponse?.exito && grupoResponse.data) {
        this.grupo = grupoResponse.data.find((g: Grupo) => g.idGrupo === this.idGrupo) || null;
      }

      // Caja común
      if (cajaResponse?.exito && cajaResponse.data) {
        this.caja = cajaResponse.data;
        await this.cargarMovimientos();
        await this.cargarPermisos();
      } else {
        // No existe caja común - mostrar opción de crear
        this.caja = null;
      }

    } catch (error) {
      this.snackBar.open('Error al cargar la caja común', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  /**
   * 📋 CARGAR MOVIMIENTOS
   */
  async cargarMovimientos(): Promise<void> {
    if (!this.caja) return;
    try {
      const filtros = this.filtrosForm.value;
      const response = await this.cajaService.obtenerMovimientos(this.caja.idCaja, this.usuarioActual.idUsuario).toPromise();
      if (response?.exito && response.data) {
        this.movimientos = response.data;
      }
    } catch (error) {
      // console.error('Error al cargar movimientos:', error);
    }
  }

  /**
   * 🔐 CARGAR PERMISOS
   */
  async cargarPermisos(): Promise<void> {
    if (!this.caja) return;
    try {
      const response = await this.cajaService.validarPermisos(this.caja.idCaja).toPromise();
      if (response?.exito && response.data) {
        this.permisos = response.data;
      }
    } catch (error) {
      // console.error('Error al cargar permisos:', error);
    }
  }

  /**
   * ➕ CREAR CAJA COMÚN
   */
  async crearCajaComun(): Promise<void> {
    if (!this.grupo) return;
    this.guardando = true;
    try {
      const response = await this.cajaService.crearCajaComun(this.idGrupo, this.usuarioActual.idUsuario).toPromise();
      if (response?.exito && response.data) {
        this.caja = response.data;
        this.snackBar.open('¡Caja común creada exitosamente!', 'Cerrar', { duration: 3000 });
        await this.cargarPermisos();
      }
    } catch (error) {
      // console.error('Error al crear caja común:', error);
      this.snackBar.open('Error al crear la caja común', 'Cerrar', { duration: 3000 });
    } finally {
      this.guardando = false;
    }
  }

  /**
   * 💰 REGISTRAR MOVIMIENTO
   */
  async registrarMovimiento(): Promise<void> {
    if (!this.movimientoForm.valid || !this.caja) return;
    this.guardando = true;
    try {
      const formData = this.movimientoForm.value;
      const movimiento = {
        idCaja: this.caja.idCaja,
        tipoMovimiento: formData.tipoMovimiento,
        concepto: formData.concepto,
        monto: formData.monto
      };
      const response = await this.cajaService.registrarMovimiento(movimiento, this.usuarioActual.idUsuario).toPromise();
      if (response?.exito) {
        this.snackBar.open('¡Movimiento registrado exitosamente!', 'Cerrar', { duration: 3000 });
        this.movimientoForm.reset({
          tipoMovimiento: 'INGRESO',
          concepto: '',
          monto: 0
        });
        this.mostrarFormulario = false;
        await this.cargarDatos();
      }
    } catch (error) {
      // console.error('Error al registrar movimiento:', error);
      this.snackBar.open('Error al registrar el movimiento', 'Cerrar', { duration: 3000 });
    } finally {
      this.guardando = false;
    }
  }

  /**
   * 🔍 APLICAR FILTROS
   */
  aplicarFiltros(): void {
    this.cargarMovimientos();
  }

  /**
   * 🔄 LIMPIAR FILTROS
   */
  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.cargarMovimientos();
  }

  /**
   * 🗑️ ELIMINAR MOVIMIENTO
   */
  async eliminarMovimiento(movimiento: MovimientoCajaDto): Promise<void> {
    const confirmacion = confirm(`¿Estás seguro de eliminar el movimiento "${movimiento.concepto}"?`);
    if (!confirmacion) return;
    try {
      const response = await this.cajaService.eliminarMovimiento(movimiento.idMovimiento, this.usuarioActual.idUsuario).toPromise();
      if (response?.exito) {
        this.snackBar.open('Movimiento eliminado', 'Cerrar', { duration: 3000 });
        await this.cargarDatos();
      }
    } catch (error) {
      // console.error('Error al eliminar movimiento:', error);
      this.snackBar.open('Error al eliminar el movimiento', 'Cerrar', { duration: 3000 });
    }
  }

  /**
   * 🎨 OBTENER COLOR DE CHIP POR TIPO
   */
  obtenerColorTipo(tipo: string): string {
    return tipo === 'INGRESO' ? 'primary' : 'warn';
  }

  /**
   * 🎨 OBTENER ICONO POR TIPO
   */
  obtenerIconoTipo(tipo: string): string {
    return tipo === 'INGRESO' ? 'add_circle' : 'remove_circle';
  }

  /**
   * 🔙 VOLVER A GRUPOS
   */
  volver(): void {
    this.router.navigate(['/grupos/detalle'], { 
      queryParams: { id: this.idGrupo } 
    });
  }
}

// ENDPOINT CONSUMIDO: GET /api/caja (Caja común del usuario o grupo)
// Servicio: CajaComunService.obtenerCaja()
// Feedback visual y manejo de errores implementado.
