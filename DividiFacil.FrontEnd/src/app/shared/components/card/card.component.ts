import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class CardComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() iconColor: string = 'primary';
  @Input() value?: string | number;
  @Input() loading: boolean = false;
  @Input() clickable: boolean = false;
  @Input() showAction: boolean = false;
  @Input() actionText: string = 'Ver más';
  @Input() actionIcon: string = 'arrow_forward';
}
