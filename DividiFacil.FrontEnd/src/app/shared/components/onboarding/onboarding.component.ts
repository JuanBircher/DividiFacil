import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  imports: [CommonModule]
})
export class OnboardingComponent {
  step = 0;
  @Output() finish = new EventEmitter<void>();

  steps = [
    {
      title: '¡Bienvenido a DividiFácil!',
      description: 'Divide gastos, gestiona grupos y mantén tus finanzas claras. Te mostramos lo esencial para empezar.'
    },
    {
      title: 'Estadísticas rápidas',
      description: 'Consulta tus balances y movimientos recientes en la parte superior del dashboard.'
    },
    {
      title: 'Acciones rápidas',
      description: 'Crea un grupo o registra un gasto en segundos desde el botón flotante o el menú.'
    },
    {
      title: 'Actividad y grupos',
      description: 'Visualiza tu actividad y accede a tus grupos recientes fácilmente.'
    },
    {
      title: '¡Listo!',
      description: 'Ya puedes comenzar a usar DividiFácil. Puedes volver a ver este tour desde tu perfil.'
    }
  ];

  next() {
    if (this.step < this.steps.length - 1) {
      this.step++;
    } else {
      this.finish.emit();
    }
  }

  prev() {
    if (this.step > 0) {
      this.step--;
    }
  }
}
