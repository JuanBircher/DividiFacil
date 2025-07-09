import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ViewChild } from '@angular/core';
import { NavbarComponent } from './layout/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'DividiFacil.FrontEnd';
  darkMode = false;

  // Cambia el modo oscuro y actualiza la clase en <body>
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  onActivate(componentRef: any) {
    // Si el componente tiene propiedades para darkMode, se las pasamos
    if ('darkMode' in componentRef) {
      componentRef.darkMode = this.darkMode;
    }
    if ('toggleDarkMode' in componentRef) {
      componentRef.toggleDarkMode = this.toggleDarkMode.bind(this);
    }
  }
}
