import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

// Servicios y Modelos
import { GrupoService } from '../../../core/services/grupo.service';
import { GrupoDto, ModoOperacion } from '../../../core/models/grupo.model';

// Pipes
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-listado-grupos',
  standalone: true,
  templateUrl: './listado-grupos.component.html',
  styleUrls: ['./listado-grupos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    CardComponent,
    LoadingSpinnerComponent
  ]
})
export class ListadoGruposComponent implements OnInit, OnDestroy {
  grupos: GrupoDto[] = [];
  gruposFiltrados: GrupoDto[] = []; // 🔧 NUEVO: Arreglo para grupos filtrados
  cargando = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private grupoService: GrupoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarGrupos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarGrupos(): void {
    this.cargando = true;
    this.error = null;
    this.cdr.markForCheck();

    // console.log('🔄 Cargando grupos...');

    this.grupoService.obtenerGrupos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => { 
          this.cargando = false;
          if (response.exito && response.data) {
            this.grupos = response.data;
            this.gruposFiltrados = [...this.grupos];
            this.aplicarFiltros();
          } else {
            this.grupos = [];
            this.gruposFiltrados = [];
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.cargando = false;
          // console.error('Error al cargar grupos:', error);
          this.cdr.markForCheck();
        }
      });
  }

  aplicarFiltros(): void {
    // Lógica para aplicar filtros a this.gruposFiltrados
  }

  obtenerColorModo(modo: string): string {
    switch (modo) {
      case ModoOperacion.EQUITATIVO:
        return 'primary';
      case ModoOperacion.PROPORCIONAL:
        return 'accent';
      case ModoOperacion.ESTANDAR:
        return 'warn';
      default:
        return 'primary';
    }
  }

  obtenerIconoModo(modo: string): string {
    switch (modo) {
      case ModoOperacion.EQUITATIVO:
        return 'balance';
      case ModoOperacion.PROPORCIONAL:
        return 'pie_chart';
      case ModoOperacion.ESTANDAR:
        return 'timeline';
      default:
        return 'group';
    }
  }

  trackByGrupoId = (index: number, grupo: GrupoDto): string => grupo.idGrupo;

  refrescar(): void {
    this.cargarGrupos();
  }
}

// ENDPOINT CONSUMIDO: GET /api/grupos (Listado de grupos del usuario autenticado)
// Servicio: GrupoService.obtenerGrupos()
// Feedback visual y manejo de errores implementado.