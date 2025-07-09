import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ]
})
export class NavbarComponent {
  @Input() nombreUsuario: string = '';
  @Input() darkMode: boolean = false;
  @Input() notificaciones: number = 0;
  @Output() toggleMenu = new EventEmitter<void>();
  @Output() toggleDarkMode = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() accionRapida = new EventEmitter<void>();
  // Accesibilidad
  ariaLabel: string = 'Barra de navegación principal';

  // Método para emitir el evento correctamente desde el template
  onToggleDarkMode() {
    this.toggleDarkMode.emit();
  }
}
