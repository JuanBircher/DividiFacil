import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

// ✅ MATERIAL MODULES
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';

// ✅ CDK MODULES - PARA VIRTUAL SCROLLING
import { ScrollingModule } from '@angular/cdk/scrolling';

// ✅ SERVICIOS Y MODELOS
import { GastoService } from '../../../core/services/gasto.service';
import { GrupoService } from '../../../core/services/grupo.service';
import { GastoDto } from '../../../core/models/gasto.model';
import { GrupoDto } from '../../../core/models/grupo.model';

// ✅ PIPES
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CardComponent } from '../../../shared/components/card/card.component';

import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-listado-gastos',
  standalone: true,
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatMenuModule,
    MatDividerModule,
    ScrollingModule, 
    DateFormatPipe,
    CardComponent 
  ]
})
export class ListadoGastosComponent implements OnInit, OnDestroy {
  // ✅ PROPIEDADES EXISTENTES
  gastos: GastoDto[] = [];
  grupo: import('../../../core/models/grupo.model').GrupoConMiembrosDto | null = null;
  loading = false;
  error: string | null = null;
  
  // ✅ PAGINACIÓN
  totalItems = 0;
  itemsPorPagina = 10;
  paginaActual = 1;
  
  // ✅ FILTROS
  filtrosForm: FormGroup;
  opcionesOrdenamiento = [
    { valor: 'fecha_desc', nombre: 'Más recientes' },
    { valor: 'fecha_asc', nombre: 'Más antiguos' },
    { valor: 'monto_desc', nombre: 'Mayor monto' },
    { valor: 'monto_asc', nombre: 'Menor monto' },
    { valor: 'descripcion_asc', nombre: 'Descripción A-Z' }
  ];
  
  private destroy$ = new Subject<void>();
  private idGrupoActual: string | null = null;
  usuarioActual: any = null;
  esMiembroGrupo: boolean = false;

  constructor(
    private gastoService: GastoService,
    private grupoService: GrupoService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.filtrosForm = this.fb.group({
      busqueda: [''],
      ordenamiento: ['fecha_desc']
    });
  }

  ngOnInit(): void {
    this.inicializarComponente();
    this.configurarFiltros();

    // Obtener usuario actual
    const usuario = localStorage.getItem('usuario');
    this.usuarioActual = usuario ? JSON.parse(usuario) : null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private inicializarComponente(): void {
    // Obtener ID del grupo desde la ruta
    this.route.paramMap.subscribe(params => {
      this.idGrupoActual = params.get('idGrupo');
      if (this.idGrupoActual) {
        this.cargarDatosGrupo();
        this.cargarGastos();
      }
    });
  }

  private configurarFiltros(): void {
    this.filtrosForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.aplicarFiltros();
      });
  }

  private cargarDatosGrupo(): void {
    if (!this.idGrupoActual) return;
    this.grupoService.obtenerGrupoConMiembros(this.idGrupoActual)
      .subscribe({
        next: (response) => {
          if (response.exito && response.data) {
            this.grupo = response.data;
            // Validar membresía
            this.esMiembroGrupo = !!this.grupo.miembros?.some(
              (m: any) => m.idUsuario === this.usuarioActual?.idUsuario
            );
            this.cdr.markForCheck();
          }
        },
        error: (error) => {
          // console.error('Error al cargar grupo:', error);
        }
      });
  }

  /**
   * 🔍 MÉTODOS DE VALIDACIÓN
   */
  private validarDatosGasto(gasto: any): boolean {
    return gasto && 
           gasto.idGasto && 
           (gasto.descripcion || gasto.monto);
  }

  private sanitizarGasto(gasto: any): any {
    return {
      ...gasto,
      descripcion: gasto.descripcion || 'Sin descripción',
      categoria: gasto.categoria || 'Otros',
      nombreMiembroPagador: gasto.nombreMiembroPagador || 'Sin pagador',
      monto: gasto.monto || 0,
      detalles: gasto.detalles || []
    };
  }

  /**
   * 📊 PROCESAMIENTO DE DATOS
   */
  private procesarGastos(gastos: any[]): any[] {
    if (!Array.isArray(gastos)) {
      return [];
    }

    return gastos
      .filter(gasto => this.validarDatosGasto(gasto))
      .map(gasto => this.sanitizarGasto(gasto));
  }

  private cargarGastos(): void {
    this.loading = true;
    
    // Método que SÍ existe
    this.gastoService.obtenerGastos().subscribe({
      next: (response) => {
        if (response.exito && response.data) {
          this.gastos = response.data;
        } else {
          this.error = response.mensaje || 'Error al cargar gastos';
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        // console.error('Error:', error);
        this.error = 'Error al cargar gastos';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  //Método para cargar gastos paginados
  cargarGastosPaginados(pagina: number = 1): void {
    this.loading = true;
    
    this.gastoService.obtenerGastosPaginados(this.idGrupoActual ?? '', pagina, 20).subscribe({
      next: (response) => {
        if (response.exito && response.data) {
          this.gastos = response.data;
          this.totalItems = response.totalItems ?? 0;
          this.paginaActual = response.paginaActual;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        // console.error('Error:', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private aplicarFiltros(): void {
    this.cargarGastos();
  }

  /**
   * 🎯 TRACKBY FUNCTIONS - OPTIMIZACIÓN DE RENDIMIENTO
   */
  trackByGasto = (index: number, gasto: any): string => {
    return gasto.idGasto || `gasto-${index}`;
  };

  trackByDetalle = (index: number, detalle: any): string => {
    return detalle.idDetalle || detalle.idMiembroDeudor || `detalle-${index}`;
  };

  /**
   * 🎨 MÉTODOS PARA TEMPLATE
   */
  obtenerIconoCategoria(categoria: string | undefined | null): string {
    // ✅ VALIDAR Y PROPORCIONAR FALLBACK
    if (!categoria) {
      return 'assets/icons/default.png';
    }

    const iconos: { [key: string]: string } = {
      'Alimentación': 'assets/icons/food.png',
      'Transporte': 'assets/icons/transport.png',
      'Entretenimiento': 'assets/icons/entertainment.png',
      'Salud': 'assets/icons/health.png',
      'Educación': 'assets/icons/education.png',
      'Hogar': 'assets/icons/home.png',
      'Ropa': 'assets/icons/clothes.png',
      'Otros': 'assets/icons/other.png'
    };
    
    return iconos[categoria] || 'assets/icons/default.png';
  }

  obtenerColorMonto(monto: number | undefined | null): string {
    // ✅ VALIDAR Y PROPORCIONAR FALLBACK
    if (!monto || monto <= 0) {
      return 'monto-neutro';
    }

    if (monto > 10000) return 'monto-alto';
    if (monto > 5000) return 'monto-medio';
    return 'monto-bajo';
  }

  /**
   * 🎬 ACCIONES DEL USUARIO
   */
  volverAGrupos(): void {
    this.router.navigate(['/grupos']);
  }

  eliminarGasto(gasto: any): void {
    if (!gasto || !gasto.idGasto) return;
    this.gastoService.eliminarGasto(gasto.idGasto).subscribe({
      next: (response) => {
        if (response.exito) {
          this.snackBar.open('Gasto eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.actualizarLista();
        } else {
          this.snackBar.open(response.mensaje || 'Error al eliminar gasto', 'Cerrar', { duration: 3000 });
        }
      },
      error: (error) => {
        this.snackBar.open('Error al eliminar gasto', 'Cerrar', { duration: 3000 });
      }
    });
  }

  actualizarLista(): void {
    this.cargarGastos();
    this.snackBar.open('Lista de gastos actualizada', 'Cerrar', { duration: 2000 });
  }

  crearGasto(): void {
    this.router.navigate(['/gastos/alta']).then(() => {
      // Al volver, refrescar la lista
      this.cargarGastos();
    });
    this.snackBar.open('Redirigiendo a crear gasto...', 'Cerrar', { duration: 2000 });
  }

  editarGasto(gasto: any): void {
    this.router.navigate(['/gastos', gasto.idGasto, 'editar']).then(() => {
      // Al volver, refrescar la lista
      this.cargarGastos();
    });
    this.snackBar.open('Redirigiendo a editar gasto...', 'Cerrar', { duration: 2000 });
  }

  verDetalle(gasto: any): void {
    this.router.navigate(['/gastos', gasto.idGasto]);
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      busqueda: '',
      ordenamiento: 'fecha_desc'
    });
  }

  onPageChange(event: PageEvent): void {
    this.paginaActual = event.pageIndex + 1;
    this.itemsPorPagina = event.pageSize;
    this.cargarGastos();
  }

  // ENDPOINT CONSUMIDO: GET /api/gastos (Listado de gastos del usuario o grupo)
  // Servicio: GastoService.obtenerGastos()
  // Feedback visual y manejo de errores implementado.
}
