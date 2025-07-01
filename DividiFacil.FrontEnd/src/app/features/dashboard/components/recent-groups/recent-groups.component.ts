import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { GrupoService } from '../../../../core/services/grupo.service';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { StatusPipe } from '../../../../shared/pipes/status.pipe';

@Component({
  selector: 'app-recent-groups',
  standalone: true,
  templateUrl: './recent-groups.component.html',
  styleUrls: ['./recent-groups.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    CardComponent,
    LoadingSpinnerComponent,
    DateFormatPipe,
    StatusPipe
  ]
})
export class RecentGroupsComponent implements OnInit {
  grupos: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private grupoService: GrupoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarGruposRecientes();
  }

  /**
   * 🎓 EXPLICACIÓN: Carga los grupos y toma solo los 5 más recientes
   */
  cargarGruposRecientes(): void {
    this.loading = true;
    this.error = null;

    this.grupoService.getGrupos().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.exito && response.data) {
          // Tomar solo los primeros 5 grupos (los más recientes)
          this.grupos = response.data.slice(0, 5);
        } else {
          this.error = response.mensaje || 'Error al cargar grupos';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Error al cargar grupos recientes';
        console.error('Error cargando grupos recientes:', err);
      }
    });
  }

  /**
   * 🎓 EXPLICACIÓN: Navega al detalle del grupo
   */
  verGrupo(grupoId: number): void {
    this.router.navigate(['/grupos/detalle', grupoId]);
  }

  /**
   * 🎓 EXPLICACIÓN: Navega a la lista completa de grupos
   */
  verTodosLosGrupos(): void {
    this.router.navigate(['/grupos']);
  }

  /**
   * 🎓 EXPLICACIÓN: Navega para crear un nuevo grupo
   */
  crearGrupo(): void {
    this.router.navigate(['/grupos/alta']);
  }
}