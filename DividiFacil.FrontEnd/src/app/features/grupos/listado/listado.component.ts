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
  loading = false;

  constructor(private grupoService: GrupoService) {}

  ngOnInit() {
    this.loading = true;
    this.grupoService.getGrupos().subscribe({
      next: (resp) => {
        this.grupos = resp?.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Podrías mostrar un snackbar de error si lo prefieres
      }
    });
  }
}