import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';

// Servicios REALES
import { GrupoService } from '../../../../core/services/grupo.service';

// Modelos
import { GrupoDto } from '../../../../core/models/grupo.model';

@Component({
  selector: 'app-recent-groups',
  standalone: true,
  templateUrl: './recent-groups.component.html',
  styleUrls: ['./recent-groups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ]
})
export class RecentGroupsComponent implements OnInit, OnDestroy {
  grupos: GrupoDto[] = [];
  cargando = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private grupoService: GrupoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarGruposRecientes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 🔄 CARGAR GRUPOS RECIENTES - OPTIMIZADO
   */
  cargarGruposRecientes(): void {
    this.cargando = true;
    this.error = null;
    this.cdr.markForCheck();

    console.log('🔄 Cargando grupos recientes...');

    this.grupoService.obtenerGrupos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.cargando = false;
          
          if (response.exito && Array.isArray(response.data)) {
            console.log('👥 Grupos REALES obtenidos:', response.data);
            
            // ✅ FILTRAR, ORDENAR Y LIMITAR
            this.grupos = response.data
              .filter(grupo => grupo.idGrupo === 'Activo') // Solo grupos activos
              .sort((a, b) => {
                // Ordenar por participación reciente + fecha de creación
                const fechaA = new Date(a.fechaCreacion || a.fechaCreacion);
                const fechaB = new Date(b.fechaCreacion || b.fechaCreacion);
                return fechaB.getTime() - fechaA.getTime();
              })
              .slice(0, 6); // Mostrar máximo 6 grupos
              
          } else if (Array.isArray(response)) {
            // Fallback para respuesta directa
            this.grupos = response
              .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
              .slice(0, 6);
          } else {
            this.grupos = [];
            this.error = 'No se pudieron cargar los grupos.';
          }
          
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('❌ Error al cargar grupos recientes:', error);
          this.error = 'Error al cargar los grupos recientes.';
          this.grupos = [];
          this.cargando = false;
          this.cdr.markForCheck();
        }
      });
  }

  verGrupo(idGrupo: string): void {
    console.log('🔗 Navegando a grupo:', idGrupo);
    this.router.navigate(['/grupos', idGrupo]);
  }

  verTodosLosGrupos(): void {
    this.router.navigate(['/grupos']);
  }

  crearGrupo(): void {
    this.router.navigate(['/grupos/alta']);
  }

  // ✅ MÉTODO CORREGIDO CON ENUM
  obtenerColorModo(modo: string): string {
    switch (modo) {
      case 'Equitativo':
        return 'primary';
      case 'Proporcional':
        return 'accent';
      case 'Estandar':
        return 'warn';
      default:
        return 'primary';
    }
  }

  trackByGrupoId = (index: number, grupo: GrupoDto): string => grupo.idGrupo;
}