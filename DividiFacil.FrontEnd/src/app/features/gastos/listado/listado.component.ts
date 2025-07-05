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

// ✅ CDK MODULES - PARA VIRTUAL SCROLLING
import { ScrollingModule } from '@angular/cdk/scrolling';

// ✅ SERVICIOS Y MODELOS
import { GastoService } from '../../../core/services/gasto.service';
import { GrupoService } from '../../../core/services/grupo.service';
import { GastoDto } from '../../../core/models/gasto.model';
import { GrupoDto } from '../../../core/models/grupo.model';

// ✅ PIPES
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

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
    ScrollingModule, // ✅ AGREGAR PARA cdk-virtual-scroll-viewport
    DateFormatPipe
  ]
})
export class ListadoGastosComponent implements OnInit, OnDestroy {
  // ✅ PROPIEDADES EXISTENTES
  gastos: GastoDto[] = [];
  grupo: GrupoDto | null = null;
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

  constructor(
    private gastoService: GastoService,
    private grupoService: GrupoService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.filtrosForm = this.fb.group({
      busqueda: [''],
      ordenamiento: ['fecha_desc']
    });
  }

  ngOnInit(): void {
    this.inicializarComponente();
    this.configurarFiltros();
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

    // ✅ USAR: Método que SÍ existe
    this.grupoService.obtenerGrupo(this.idGrupoActual)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.exito && response.data) {
            this.grupo = response.data;
            this.cdr.markForCheck();
          }
        },
        error: (error) => {
          console.error('Error al cargar grupo:', error);
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
    
    // ✅ USAR: Método que SÍ existe
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
        console.error('Error:', error);
        this.error = 'Error al cargar gastos';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ✅ NUEVO: Método para cargar gastos paginados
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
        console.error('Error:', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private aplicarFiltros(): void {
    // Implementar lógica de filtros
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

  actualizarLista(): void {
    this.cargarGastos();
  }

  crearGasto(): void {
    this.router.navigate(['/gastos/alta']);
  }

  verDetalle(gasto: any): void {
    this.router.navigate(['/gastos', gasto.idGasto]);
  }

  editarGasto(gasto: any): void {
    this.router.navigate(['/gastos', gasto.idGasto, 'editar']);
  }

  eliminarGasto(gasto: any): void {
    // Implementar lógica de eliminación
    console.log('Eliminar gasto:', gasto.idGasto);
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
}
