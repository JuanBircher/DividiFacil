import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth.service';
import { DashboardStatsComponent } from './components/dashboard-stats/dashboard-stats.component';
import { RecentGroupsComponent } from './components/recent-groups/recent-groups.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DashboardStatsComponent,
    RecentGroupsComponent,
    QuickActionsComponent
  ]
})
export class DashboardComponent implements OnInit {
  nombreUsuario: string = '';
  horaActual: string = '';
  saludoPersonalizado: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.configurarSaludo();
    this.actualizarHora();
    
    // Actualizar la hora cada minuto
    setInterval(() => {
      this.actualizarHora();
      this.configurarSaludo();
    }, 60000);
  }

  /**
   * 🎓 EXPLICACIÓN: Obtiene el nombre del usuario actual
   * Usa tu AuthService existente para obtener información del usuario
   */
  private cargarDatosUsuario(): void {
    const usuario = this.authService.obtenerUsuario();
    if (usuario) {
      this.nombreUsuario = usuario.nombre || 'Usuario';
    } else {
      // Si no hay usuario en memoria, intentar obtener del token
      const infoToken = this.authService.obtenerInfoToken();
      if (infoToken) {
        this.nombreUsuario = infoToken.nombre || 'Usuario';
      }
    }
  }

  /**
   * 🎓 EXPLICACIÓN: Configura un saludo personalizado según la hora
   */
  private configurarSaludo(): void {
    const hora = new Date().getHours();
    
    if (hora >= 5 && hora < 12) {
      this.saludoPersonalizado = '🌅 Buenos días';
    } else if (hora >= 12 && hora < 18) {
      this.saludoPersonalizado = '☀️ Buenas tardes';
    } else {
      this.saludoPersonalizado = '🌙 Buenas noches';
    }
  }

  /**
   * 🎓 EXPLICACIÓN: Actualiza la hora actual mostrada
   */
  private actualizarHora(): void {
    const ahora = new Date();
    this.horaActual = ahora.toLocaleString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * 🎓 EXPLICACIÓN: Método para cerrar sesión (heredado de tu código)
   */
  logout(): void {
    this.authService.logout();
  }
}