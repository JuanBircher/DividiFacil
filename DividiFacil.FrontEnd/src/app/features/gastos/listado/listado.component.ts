import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { GastoService } from '../../../core/services/gasto.service';
import { GrupoService } from '../../../core/services/grupo.service';
import { GastoDto } from '../../../core/models/gasto.model';
import { GrupoConMiembrosDto } from '../../../core/models/grupo.model';

interface FiltrosGasto {
  pagina: number;
  tamanioPagina: number;
  busqueda?: string;
  ordenamiento?: string;
}

@Component({
  selector: 'app-listado',
  standalone: true,
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    RouterModule
  ]
})
export class ListadoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Formulario de filtros
  filtrosForm: FormGroup;
  
  // Datos
  gastos: GastoDto[] = [];
  grupo: GrupoConMiembrosDto | null = null;
  idGrupo: string = '';
  
  // Paginación
  totalItems = 0;
  paginaActual = 1;
  itemsPorPagina = 10;
  totalPaginas = 0;
  
  // Estados
  loading = false;
  eliminando = false;
  
  // Opciones de ordenamiento
  opcionesOrdenamiento = [
    { valor: 'fecha_desc', nombre: 'Más recientes primero' },
    { valor: 'fecha_asc', nombre: 'Más antiguos primero' },
    { valor: 'monto_desc', nombre: 'Mayor monto primero' },
    { valor: 'monto_asc', nombre: 'Menor monto primero' }
  ];

  constructor(
    private fb: FormBuilder,
    private gastoService: GastoService,
    private grupoService: GrupoService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filtrosForm = this.fb.group({
      busqueda: [''],
      ordenamiento: ['fecha_desc']
    });
  }

  ngOnInit(): void {
    // Obtener grupo de query params
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.idGrupo = params['grupo'];
        if (this.idGrupo) {
          this.cargarGrupo();
          this.cargarGastos();
        } else {
          this.router.navigate(['/grupos']);
        }
      });

    // Configurar búsqueda reactiva
    this.filtrosForm.get('busqueda')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.paginaActual = 1;
        this.cargarGastos();
      });

    // Configurar ordenamiento reactivo
    this.filtrosForm.get('ordenamiento')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.paginaActual = 1;
        this.cargarGastos();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🔄 CARGAR INFORMACIÓN DEL GRUPO
   */
  cargarGrupo(): void {
    this.grupoService.obtenerMiembros(this.idGrupo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.exito && response.data) {
            this.grupo = response.data;
          }
        },
        error: (err) => {
          console.error('Error al cargar grupo:', err);
        }
      });
  }

  /**
   * 📋 CARGAR LISTA DE GASTOS
   */
  cargarGastos(): void {
    this.loading = true;
    
    const filtros: FiltrosGasto = {
      pagina: this.paginaActual,
      tamanioPagina: this.itemsPorPagina,
      busqueda: this.filtrosForm.get('busqueda')?.value || undefined,
      ordenamiento: this.filtrosForm.get('ordenamiento')?.value
    };

    this.gastoService.obtenerGastosPaginados(this.idGrupo, filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.exito && response.data) {
            this.gastos = response.data.items || [];
            this.totalItems = response.data.totalItems || 0;
            this.paginaActual = response.data.paginaActual || 1;
            this.itemsPorPagina = response.data.itemsPorPagina || 10;
            this.totalPaginas = response.data.totalPaginas || 0;
          } else {
            this.gastos = [];
            this.snackBar.open('Error al cargar gastos', 'Cerrar', { duration: 3000 });
          }
        },
        error: (err) => {
          this.loading = false;
          this.gastos = [];
          console.error('Error al cargar gastos:', err);
          this.snackBar.open('Error al cargar gastos', 'Cerrar', { duration: 3000 });
        }
      });
  }

  /**
   * 📄 MANEJAR CAMBIO DE PÁGINA
   */
  onPageChange(event: PageEvent): void {
    this.paginaActual = event.pageIndex + 1;
    this.itemsPorPagina = event.pageSize;
    this.cargarGastos();
  }

  /**
   * 🔄 LIMPIAR FILTROS
   */
  limpiarFiltros(): void {
    this.filtrosForm.patchValue({
      busqueda: '',
      ordenamiento: 'fecha_desc'
    });
    this.paginaActual = 1;
    this.cargarGastos();
  }

  /**
   * ➕ CREAR NUEVO GASTO
   */
  crearGasto(): void {
    this.router.navigate(['/gastos/alta'], {
      queryParams: { grupo: this.idGrupo }
    });
  }

  /**
   * 👁️ VER DETALLE DEL GASTO
   */
  verDetalle(gasto: GastoDto): void {
    // TODO: Implementar en Fase 5 - Paso 2
    this.snackBar.open('Funcionalidad de detalle próximamente', 'Cerrar', { duration: 2000 });
  }

  /**
   * ✏️ EDITAR GASTO
   */
  editarGasto(gasto: GastoDto): void {
    // TODO: Implementar en Fase 5 - Paso 3
    this.snackBar.open('Funcionalidad de edición próximamente', 'Cerrar', { duration: 2000 });
  }

  /**
   * 🗑️ ELIMINAR GASTO
   */
  async eliminarGasto(gasto: GastoDto): Promise<void> {
    if (!confirm(`¿Estás seguro de eliminar el gasto "${gasto.descripcion}"?`)) {
      return;
    }

    this.eliminando = true;

    try {
      await this.gastoService.eliminarGasto(gasto.idGasto).toPromise();
      
      this.snackBar.open('Gasto eliminado exitosamente', 'Cerrar', { duration: 3000 });
      
      // Recargar lista
      this.cargarGastos();
      
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      this.snackBar.open('Error al eliminar el gasto', 'Cerrar', { duration: 3000 });
    } finally {
      this.eliminando = false;
    }
  }

  /**
   * 🔄 ACTUALIZAR LISTA
   */
  actualizarLista(): void {
    this.cargarGastos();
  }

  /**
   * 🏠 VOLVER A GRUPOS
   */
  volverAGrupos(): void {
    this.router.navigate(['/grupos']);
  }

  /**
   * 🎨 OBTENER ICONO DE CATEGORÍA
   */
  obtenerIconoCategoria(categoria?: string): string {
    if (!categoria) return 'receipt';
    
    const iconos: { [key: string]: string } = {
      'Alimentación': 'restaurant',
      'Transporte': 'directions_car',
      'Entretenimiento': 'local_activity',
      'Servicios': 'build',
      'Compras': 'shopping_cart',
      'Salud': 'local_hospital',
      'Viajes': 'flight',
      'Otros': 'category'
    };
    
    return iconos[categoria] || 'receipt';
  }

  /**
   * 🎨 OBTENER COLOR DE MONTO
   */
  obtenerColorMonto(monto: number): string {
    if (monto > 1000) return 'high-amount';
    if (monto > 100) return 'medium-amount';
    return 'low-amount';
  }

  /**
   * 🔄 TRACK BY PARA MEJORAR PERFORMANCE
   */
  trackByGasto(index: number, gasto: GastoDto): string {
    return gasto.idGasto;
  }

  // Exponer Math para el template
  Math = Math;
}
