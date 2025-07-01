import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Grupo } from '../../../core/models/grupo.model';
import { GrupoService } from '../../../core/services/grupo.services';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-grupos-listado',
  standalone: true,
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule
  ]
})
export class ListadoComponent implements OnInit {
  grupos: Grupo[] = [];
  cargando = true;

  constructor(private grupoService: GrupoService) {}

  ngOnInit(): void {
  this.grupoService.getGrupos().subscribe({
    next: (resp) => {
      console.log('Respuesta del backend:', resp);
      this.cargando = false;
      // El backend retorna un array de grupos directamente
      const grupos = resp.data || [];
      this.grupos = grupos.map((g: any) => ({
        ...g,
        nombre: g.nombreGrupo // adaptación por naming
      }));
      // Opcional: console.log para depurar
      console.log('Grupos adaptados:', this.grupos);
    },
    error: () => {
      this.cargando = false;
      this.grupos = [];
    }
  });
}
}