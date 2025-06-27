import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `dashboard.component.html`,
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, MatCardModule, MatButtonModule],
})
export class DashboardComponent {
  nombreUsuario = localStorage.getItem('nombreUsuario') || '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}