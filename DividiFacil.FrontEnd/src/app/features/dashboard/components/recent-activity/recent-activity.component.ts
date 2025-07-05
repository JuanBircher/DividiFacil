import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, forkJoin } from 'rxjs';

// ✅ SOLO SERVICIOS QUE EXISTEN
import { GastoService } from '../../../../core/services/gasto.service';
import { GrupoService } from '../../../../core/services/grupo.service';

// ✅ SOLO MODELOS QUE EXISTEN
import { GastoDto } from '../../../../core/models/gasto.model';
import { GrupoDto } from '../../../../core/models/grupo.model';

// ✅ PIPES CORRECTOS
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

interface ActividadItem {
  id: string;
  tipo: 'gasto' | 'grupo';
  descripcion: string;
  monto: number;
  fecha: Date;
  icono: string;
  usuarioRelacionado?: string;
  grupoRelacionado?: string;
  categoria?: string;
  estado?: string;
}

interface FiltroItem {
  id: string;
  nombre: string;
  activo: boolean;
  tipo: 'todos' | 'gasto' | 'grupo';
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    DateFormatPipe,
    CurrencyFormatPipe
  ]
})
export class RecentActivityComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  actividadReciente: ActividadItem[] = [];
  actividadOriginal: ActividadItem[] = [];
  
  filtros: FiltroItem[] = [
    { id: 'todos', nombre: 'Todos', activo: true, tipo: 'todos' },
    { id: 'gastos', nombre: 'Gastos', activo: false, tipo: 'gasto' },
    { id: 'grupos', nombre: 'Grupos', activo: false, tipo: 'grupo' }
  ];
  
  loading = false;
  error: string | null = null;

  constructor(
    private gastoService: GastoService,
    private grupoService: GrupoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarActividadReal();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarActividadReal(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    console.log('🔄 Cargando actividad reciente...');

    // ✅ SOLO SERVICIOS QUE FUNCIONAN
    forkJoin({
      gastos: this.gastoService.obtenerRecientes(10),
      grupos: this.grupoService.obtenerGrupos()
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        console.log('📊 Datos recibidos:', data);
        this.procesarDatosActividad(data);
      },
      error: (error) => {
        console.error('❌ Error al cargar actividad:', error);
        this.error = 'Error al cargar la actividad reciente.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private procesarDatosActividad(data: any): void {
    this.actividadOriginal = [];
    
    // ✅ PROCESAR GASTOS
    if (data.gastos?.exito && Array.isArray(data.gastos.data)) {
      interface GastoApiResponse {
        exito: boolean;
        data: any[];
      }

      const gastosData: any[] = (data.gastos as GastoApiResponse).data;
      const gastosItems: ActividadItem[] = gastosData
        .slice(0, 8)
        .map((gasto: any) => this.mapearGastoAActividad(gasto));
      this.actividadOriginal.push(...gastosItems);
    }
    
    // ✅ PROCESAR GRUPOS
    if (Array.isArray(data.grupos)) {
      interface GrupoApiResponse {
        idGrupo: string;
        nombreGrupo: string;
        fechaCreacion: string;
        nombreCreador: string;
      }

      const gruposRecientes: ActividadItem[] = (data.grupos as GrupoApiResponse[])
        .sort((a: GrupoApiResponse, b: GrupoApiResponse) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
        .slice(0, 3)
        .map((grupo: GrupoApiResponse) => this.mapearGrupoAActividad(grupo));
      this.actividadOriginal.push(...gruposRecientes);
    }

    this.actividadReciente = this.actividadOriginal
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 10);

    this.loading = false;
    this.cdr.markForCheck();
    
    console.log('✅ Actividad procesada:', this.actividadReciente);
  }

  private mapearGastoAActividad(gasto: any): ActividadItem {
    return {
      id: gasto.idGasto,
      tipo: 'gasto',
      descripcion: gasto.descripcion || 'Gasto sin descripción',
      monto: gasto.monto || 0,
      fecha: new Date(gasto.fechaCreacion || gasto.fechaGasto),
      icono: this.obtenerIconoCategoria(gasto.categoria),
      usuarioRelacionado: gasto.nombreMiembroPagador || 'Usuario',
      grupoRelacionado: gasto.nombreGrupo || 'Grupo',
      categoria: gasto.categoria || 'Sin categoría',
      estado: 'activo'
    };
  }

  private mapearGrupoAActividad(grupo: any): ActividadItem {
    return {
      id: grupo.idGrupo,
      tipo: 'grupo',
      descripcion: `Grupo "${grupo.nombreGrupo}" creado`,
      monto: 0,
      fecha: new Date(grupo.fechaCreacion),
      icono: 'group_add',
      usuarioRelacionado: grupo.nombreCreador,
      grupoRelacionado: grupo.nombreGrupo,
      estado: 'activo'
    };
  }

  private obtenerIconoCategoria(categoria: string): string {
    const iconos: { [key: string]: string } = {
      'Alimentación': 'restaurant',
      'Transporte': 'directions_car',
      'Entretenimiento': 'movie',
      'Salud': 'local_hospital',
      'Otros': 'receipt'
    };
    return iconos[categoria] || 'receipt';
  }

  aplicarFiltro(filtro: FiltroItem): void {
    this.filtros.forEach(f => f.activo = false);
    filtro.activo = true;

    if (filtro.tipo === 'todos') {
      this.actividadReciente = this.actividadOriginal;
    } else {
      this.actividadReciente = this.actividadOriginal.filter(item => item.tipo === filtro.tipo);
    }
    
    this.cdr.markForCheck();
  }

  verTodosLosGastos(): void {
    console.log('🔗 Navegando a todos los gastos');
  }

  refrescar(): void {
    this.cargarActividadReal();
  }

  // ✅ MÉTODOS PARA TEMPLATE
  getIconStyles(tipo: string): any {
    const baseStyles = {
      'flex-shrink': '0',
      'width': '40px',
      'height': '40px',
      'border-radius': '50%',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'margin-right': '1rem'
    };

    switch (tipo) {
      case 'gasto':
        return { ...baseStyles, 'background-color': '#ffebee', 'color': '#c62828' };
      case 'grupo':
        return { ...baseStyles, 'background-color': '#e3f2fd', 'color': '#1565c0' };
      default:
        return baseStyles;
    }
  }

  onMouseEnter(event: any): void {
    event.target.style.backgroundColor = '#f5f5f5';
  }

  onMouseLeave(event: any): void {
    event.target.style.backgroundColor = 'transparent';
  }

  // ✅ MÉTODOS PARA PIPES EN TEMPLATE
  dateFormat(fecha: Date): string {
    return new DateFormatPipe().transform(fecha);
  }

  currencyFormat(monto: number): string {
    return new CurrencyFormatPipe().transform(monto);
  }

  trackByItemId = (index: number, item: ActividadItem): string => item.id;
  trackByFiltro = (index: number, filtro: FiltroItem): string => filtro.id;
}