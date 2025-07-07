import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatNavList, MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatBadgeModule
  ]
})
export class SidebarComponent {
  @Input() gruposMenuAbierto: boolean = false;
  @Input() contadorNotificaciones: number = 0;
  @Output() toggleGruposMenu = new EventEmitter<void>();
  // Accesibilidad
  ariaLabel: string = 'Menú lateral de navegación';
}
