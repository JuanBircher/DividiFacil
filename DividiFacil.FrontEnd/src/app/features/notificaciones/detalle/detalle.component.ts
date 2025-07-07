import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { NotificacionDto } from '../../../core/models/notificacion.model';
import { AuthService } from '../../../core/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ResponseDto } from '../../../core/models/response.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-detalle',
  standalone: true,
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss',
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    CardComponent,
    MatIconModule,
    LoadingSpinnerComponent
  ]
})
export class DetalleComponent implements OnInit {
  notificacion: NotificacionDto | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private notificacionService: NotificacionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    const idNotificacion = this.route.snapshot.queryParamMap.get('id');
    const usuario = this.authService.obtenerUsuario();
    if (idNotificacion && usuario) {
      this.notificacionService.obtenerPendientes(usuario.idUsuario).subscribe({
        next: (resp: ResponseDto<NotificacionDto[]>) => {
          if (resp.exito && resp.data) {
            this.notificacion = resp.data.find((n: NotificacionDto) => n.idNotificacion === idNotificacion) || null;
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }
}
