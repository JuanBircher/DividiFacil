import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class NavbarComponent {
  @Input() nombreUsuario: string = '';
  @Output() logout = new EventEmitter<void>();
  @Output() toggleMenu = new EventEmitter<void>();
  // Accesibilidad
  ariaLabel: string = 'Barra de navegación principal';

  // Dark mode toggle
  darkMode: boolean = false;

  constructor() {
    // Leer preferencia guardada
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    this.setDarkModeClass();
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    this.setDarkModeClass();
  }

  private setDarkModeClass() {
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
