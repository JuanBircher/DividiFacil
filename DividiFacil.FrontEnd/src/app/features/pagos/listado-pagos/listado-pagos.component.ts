import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
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
import { PagoDto } from '../../../core/models/pago.model';
import { Grupo } from '../../../core/models/grupo.model';
import { AuthService } from '../../../core/auth.service';
import { ApiResponse } from '../../../core/models/response.model';

// Pipes
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-listado-pagos',
  standalone: true,
  templateUrl: './listado-pagos.component.html',
  styleUrls: ['./listado-pagos.component.scss'],
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
    CurrencyFormatPipe
]
})
export class ListadoPagosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estados
  loading = false;
  procesando = false;
  idGrupoFiltro: string | null = null;

  // Datos
  pagosRealizados: PagoDto[] = [];
  pagosRecibidos: PagoDto[] = [];
  gruposDisponibles: Grupo[] = [];
  usuarioActual: any;
  todosLosPagos: any[] = [];

  // Filtros
  filtrosForm: FormGroup;
  idGrupoPreseleccionado = '';
  tabSelectedIndex = 0;

  // Configuración tabla
  displayedColumns = ['fecha', 'concepto', 'receptor', 'monto', 'estado', 'acciones'];

  // ✅ NUEVO: Mapas para nombres de usuarios y grupos
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
    private snackBar: MatSnackBar
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
   * 🔄 CARGAR GRUPOS
   */
  cargarGrupos(): void {
    this.grupoService.getGrupos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Grupo[]>) => {
          if (response.exito && response.data) {
            this.gruposDisponibles = response.data;
          }
        },
        error: (err: any) => {
          console.error('Error al cargar grupos:', err);
        }
      });
  }

  /**
   * 🔄 CARGAR PAGOS
   */
  cargarPagos(): void {
    this.loading = true;
    const filtros = this.filtrosForm.value;

    this.pagoService.obtenerPagos(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<PagoDto[]>) => {
          this.loading = false;
          if (response.exito && response.data) {
            this.todosLosPagos = response.data;
            this.separarPagos(response.data);
            this.cargarNombresUsuarios(response.data);
          }
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Error al cargar pagos:', err);
          this.snackBar.open('Error al cargar pagos', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * ✅ NUEVO: Cargar nombres de usuarios para mostrar en template
   */
  private cargarNombresUsuarios(pagos: PagoDto[]): void {
    const idsUsuarios = new Set<string>();
    
    pagos.forEach(pago => {
      idsUsuarios.add(pago.idPagador);
      idsUsuarios.add(pago.idReceptor);
    });

    // TODO: Implementar servicio para obtener nombres de usuarios
    // Por ahora, usar IDs como nombres temporalmente
    idsUsuarios.forEach(id => {
      this.usuariosMap.set(id, `Usuario ${id.substring(0, 8)}`);
    });
  }

  /**
   * 🔄 SEPARAR PAGOS REALIZADOS VS RECIBIDOS
   */
  separarPagos(pagos: PagoDto[]): void {
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
  verDetallePago(pago: PagoDto): void {
    this.router.navigate(['/detalle-pagos', pago.idPago]);
  }

  /**
   * ✅ CONFIRMAR PAGO
   */
  confirmarPago(pago: PagoDto): void {
    this.procesando = true;

    this.pagoService.confirmarPago(pago.idPago)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<any>) => {
          this.procesando = false;
          if (response.exito) {
            this.snackBar.open('Pago confirmado exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.cargarPagos();
          }
        },
        error: (err: any) => {
          this.procesando = false;
          console.error('Error al confirmar pago:', err);
          this.snackBar.open('Error al confirmar pago', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * ❌ RECHAZAR PAGO
   */
  rechazarPago(pago: PagoDto): void {
    this.procesando = true;

    this.pagoService.rechazarPago(pago.idPago)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<any>) => {
          this.procesando = false;
          if (response.exito) {
            this.snackBar.open('Pago rechazado', 'Cerrar', {
              duration: 3000,
              panelClass: ['warn-snackbar']
            });
            this.cargarPagos();
          }
        },
        error: (err: any) => {
          this.procesando = false;
          console.error('Error al rechazar pago:', err);
          this.snackBar.open('Error al rechazar pago', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * 🔄 LIMPIAR FILTROS
   */
  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.filtrosForm.patchValue({ idGrupo: this.idGrupoPreseleccionado });
  }

  /**
   * 🎨 OBTENER COLOR ESTADO
   */
  obtenerColorEstado(estado: string): string {
    switch (estado) {
      case 'Completado': return 'primary';
      case 'Pendiente': return 'warn';
      case 'Rechazado': return 'accent';
      default: return '';
    }
  }

  /**
   * 🎨 OBTENER ICONO ESTADO
   */
  obtenerIconoEstado(estado: string): string {
    switch (estado) {
      case 'Completado': return 'check_circle';
      case 'Pendiente': return 'schedule';
      case 'Rechazado': return 'cancel';
      default: return 'help';
    }
  }

  /**
   * ✅ CORREGIDO: Método verDetalle
   */
  verDetalle(pago: PagoDto): void {
    this.router.navigate(['/detalle-pagos', pago.idPago]);
  }

  /**
   * ✅ NUEVO: Obtener nombre de usuario por ID
   */
  obtenerNombreUsuario(idUsuario: string): string {
    return this.usuariosMap.get(idUsuario) || `Usuario ${idUsuario.substring(0, 8)}`;
  }

  /**
   * ✅ CORREGIDO: Obtener nombre grupo
   */
  obtenerNombreGrupo(idGrupo: string): string {
    const grupo = this.gruposDisponibles.find(g => g.idGrupo === idGrupo);
    return grupo?.nombreGrupo || `Grupo ${idGrupo.substring(0, 8)}`;
  }

  /**
   * ✅ NUEVO: Método recargar
   */
  recargar(): void {
    this.cargarPagos();
  }

  /**
   * 🔢 TRACKBY FUNCTIONS
   */
  trackByPago(index: number, pago: PagoDto): string {
    return pago.idPago;
  }

  /**
   * 🔄 PUEDE CONFIRMAR PAGO
   */
  puedeConfirmarPago(pago: PagoDto): boolean {
    return pago.estado === 'Pendiente' && pago.idReceptor === this.usuarioActual?.idUsuario;
  }

  /**
   * 🔄 PUEDE RECHAZAR PAGO
   */
  puedeRechazarPago(pago: PagoDto): boolean {
    return pago.estado === 'Pendiente' && pago.idReceptor === this.usuarioActual?.idUsuario;
  }

  volver(): void {
    // Implementa aquí la lógica para volver atrás, por ejemplo navegar a la vista anterior
    window.history.back();
  }
}
