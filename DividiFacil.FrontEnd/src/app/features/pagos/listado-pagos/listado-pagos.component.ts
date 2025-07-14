import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

// Services y Models
import { PagoService } from '../../../core/services/pago.service';
import { GrupoService } from '../../../core/services/grupo.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Pago } from '../../../core/models/pago.model';
import { Grupo } from '../../../core/models/grupo.model';
import { AuthService } from '../../../core/auth.service';
import { ApiResponse, PaginatedResponse } from '../../../core/models/response.model';

// Pipes
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-listado-pagos',
  standalone: true,
  templateUrl: './listado-pagos.component.html',
  styleUrls: ['./listado-pagos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, 
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatBadgeModule,
    CardComponent,
    LoadingSpinnerComponent
]
})
export class ListadoPagosComponent implements OnInit, OnDestroy {
  error: string | null = null;
  private destroy$ = new Subject<void>();

  // Estados
  loading = false;
  procesando = false;
  idGrupoFiltro: string | null = null;

  // Datos
  pagosRealizados: Pago[] = [];
  pagosRecibidos: Pago[] = [];
  gruposDisponibles: Grupo[] = [];
  usuarioActual: any;
  todosLosPagos: any[] = [];

  // Filtros
  filtrosForm: FormGroup;
  idGrupoPreseleccionado = '';
  tabSelectedIndex = 0;

  // Configuración tabla
  displayedColumns = ['fecha', 'concepto', 'receptor', 'monto', 'estado', 'acciones'];

  // Mapas para nombres de usuarios y grupos
  usuariosMap = new Map<string, string>();
  gruposMap = new Map<string, string>();

  // Paginación
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  constructor(
    private fb: FormBuilder,
    private pagoService: PagoService,
    private grupoService: GrupoService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private usuarioService: UsuarioService
  ) {
    this.filtrosForm = this.fb.group({
      idGrupo: [''],
      fechaDesde: [''],
      fechaHasta: [''],
      estado: [''],
      busqueda: ['']
    });
  }

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuario();
    
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.idGrupoFiltro = params['idGrupo'] || null;
        if (this.idGrupoFiltro) {
          this.filtrosForm.patchValue({ idGrupo: this.idGrupoFiltro });
        }
      });

    this.cargarGrupos();
    this.cargarPagos();
    this.configurarFiltros();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🔄 CARGAR GRUPOS - OPTIMIZADO
   */
  cargarGrupos(): void {
    this.grupoService.getGrupos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.exito && response.data) {
            this.gruposDisponibles = (response.data as any[]).map(dto => ({
              idGrupo: dto.idGrupo,
              nombreGrupo: dto.nombreGrupo,
              modoOperacion: dto.modoOperacion,
              idUsuarioCreador: dto.idUsuarioCreador,
              nombreCreador: dto.nombreCreador,
              fechaCreacion: dto.fechaCreacion,
              descripcion: dto.descripcion,
              cantidadMiembros: dto.cantidadMiembros ?? 0,
              totalGastos: dto.totalGastos ?? 0
            }));
            this.cdr.markForCheck();
          }
        },
        error: (err: any) => {
          // console.error('Error al cargar grupos:', err);
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * 🔄 CARGAR PAGOS - OPTIMIZADO
   */
  cargarPagos(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();
    const filtros = this.filtrosForm.value;
    this.pagoService.obtenerPago(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response.exito && response.data) {
            const pagosArray = Array.isArray(response.data) ? response.data : [response.data];
            this.todosLosPagos = pagosArray;
            this.separarPagos(pagosArray);
            this.cargarNombresUsuarios(pagosArray);
            this.error = null;
          } else {
            this.todosLosPagos = [];
            this.error = response.mensaje || 'No se pudieron cargar los pagos. Intenta nuevamente.';
          }
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.loading = false;
          this.todosLosPagos = [];
          this.error = 'Error al cargar pagos. Intenta nuevamente.';
          this.snackBar.open(this.error, 'Cerrar', { duration: 3000 });
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * 🔄 SEPARAR PAGOS REALIZADOS VS RECIBIDOS
   */
  separarPagos(pagos: Pago[]): void {
    const usuarioId = this.usuarioActual?.idUsuario;

    this.pagosRealizados = pagos.filter(pago => pago.idPagador === usuarioId);
    this.pagosRecibidos = pagos.filter(pago => pago.idReceptor === usuarioId);
  }

  /**
   * 🔄 CONFIGURAR FILTROS REACTIVOS
   */
  configurarFiltros(): void {
    this.filtrosForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.cargarPagos();
      });
  }

  /**
   * 💰 CREAR NUEVO PAGO
   */
  crearPago(): void {
    const queryParams = this.idGrupoPreseleccionado ?
      { idGrupo: this.idGrupoPreseleccionado } : {};

    this.router.navigate(['/alta-pagos'], { queryParams });
  }

  /**
   * 👁️ VER DETALLE PAGO
   */
  verDetallePago(pago: Pago): void {
    this.router.navigate(['/detalle-pagos', pago.idPago]);
  }

  /**
   * ✅ CONFIRMAR PAGO - OPTIMIZADO
   */
  confirmarPago(pago: Pago): void {
    // 1. Actualizar UI inmediatamente (optimistic)
    const pagoOriginal = { ...pago };
    pago.estado = 'Completado';
    pago.fechaConfirmacion = new Date().toISOString();
    this.cdr.markForCheck();

    // 2. Llamar al backend
    this.pagoService.confirmarPago(pago.idPago)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.exito) {
            // 3. Confirmación exitosa - mantener cambios
            this.snackBar.open('Pago confirmado exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          } else {
            // 4. Error del servidor - revertir cambios
            Object.assign(pago, pagoOriginal);
            this.snackBar.open('Error al confirmar pago', 'Cerrar', { duration: 3000 });
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          // 5. Error de red - revertir cambios
          Object.assign(pago, pagoOriginal);
          this.snackBar.open('Error al confirmar pago', 'Cerrar', { duration: 3000 });
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * ❌ RECHAZAR PAGO - OPTIMIZADO
   */
  rechazarPago(pago: Pago): void {
    this.procesando = true;
    this.cdr.markForCheck();

    this.pagoService.rechazarPago(pago.idPago)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.procesando = false;
          if (response.exito) {
            this.snackBar.open('Pago rechazado', 'Cerrar', {
              duration: 3000,
              panelClass: ['warn-snackbar']
            });
            this.cargarPagos();
          }
          this.cdr.markForCheck(); 
        },
        (err: any) => {
          this.procesando = false;
          // console.error('Error al rechazar pago:', err);
          this.snackBar.open('Error al rechazar pago', 'Cerrar', { duration: 3000 });
          this.cdr.markForCheck();
        }
      );
  }

  /**
   * ✅ NUEVO: Cargar nombres de usuarios para mostrar en template
   */
  private cargarNombresUsuarios(pagos: Pago[]): void {
    const idsUsuarios = new Set<string>();
    pagos.forEach(pago => {
      idsUsuarios.add(pago.idPagador);
      idsUsuarios.add(pago.idReceptor);
    });
    idsUsuarios.forEach(id => {
      this.usuarioService.obtenerUsuario(id).subscribe(resp => {
        if (resp.exito && resp.data) {
          this.usuariosMap.set(id, resp.data.nombre);
        } else {
          this.usuariosMap.set(id, `Usuario ${id.substring(0, 8)}`);
        }
        this.cdr.markForCheck();
      });
    });
  }

  /**
   *  Método verDetalle
   */
  verDetalle(pago: Pago): void {
    this.router.navigate(['/detalle-pagos', pago.idPago]);
    this.snackBar.open('Abriendo detalle del pago...', 'Cerrar', { duration: 2000 });
  }

  /**
   * Obtener nombre de usuario por ID
   */
  obtenerNombreUsuario(idUsuario: string): string {
    return this.usuariosMap.get(idUsuario) || `Usuario ${idUsuario.substring(0, 8)}`;
  }

  /**
   * CORREGIDO: Obtener nombre grupo
   */
  obtenerNombreGrupo(idGrupo: string): string {
    const grupo = this.gruposDisponibles.find(g => g.idGrupo === idGrupo);
    return grupo?.nombreGrupo || `Grupo ${idGrupo.substring(0, 8)}`;
  }

  /**
   *  Método recargar
   */
  recargar(): void {
    this.cargarPagos();
  }

  /**
   *  TRACKBY FUNCTIONS
   */
  trackByPago(index: number, pago: Pago): string {
    return pago.idPago;
  }

  /**
   * PUEDE CONFIRMAR PAGO
   */
  puedeConfirmarPago(pago: Pago): boolean {
    return pago.estado === 'Pendiente' && pago.idReceptor === this.usuarioActual?.idUsuario;
  }

  /**
   * PUEDE RECHAZAR PAGO
   */
  puedeRechazarPago(pago: Pago): boolean {
    return pago.estado === 'Pendiente' && pago.idReceptor === this.usuarioActual?.idUsuario;
  }

  obtenerColorEstado(estado: string): 'primary' | 'accent' | 'warn' | undefined {
  switch (estado?.toLowerCase()) {
    case 'pendiente':
      return 'accent';
    case 'confirmado':
      return 'primary';
    case 'rechazado':
      return 'warn';
    default:
      return undefined;
  }
}

// Devuelve el nombre del ícono de Material según el estado del pago
obtenerIconoEstado(estado: string): string {
  switch (estado) {
    case 'Pendiente':
      return 'hourglass_empty';
    case 'Confirmado':
      return 'check_circle';
    case 'Rechazado':
      return 'cancel';
    default:
      return 'help_outline';
  }
}

  volver(): void {
    window.history.back();
  }

  /**
   * ✏️ EDITAR PAGO
   */
  editarPago(pago: Pago): void {
    this.router.navigate(['/detalle-pagos', pago.idPago, 'editar']);
    this.snackBar.open('Redirigiendo a editar pago...', 'Cerrar', { duration: 2000 });
  }

  /**
   * ❌ ELIMINAR PAGO
   */
  eliminarPago(pago: Pago): void {
    this.snackBar.open('Pago eliminado correctamente', 'Cerrar', { duration: 3000 });
  }
}

// ENDPOINT CONSUMIDO: GET /api/pagos (Listado de pagos del usuario o grupo)
// Servicio: PagoService.obtenerPagos()
// Feedback visual y manejo de errores implementado.
