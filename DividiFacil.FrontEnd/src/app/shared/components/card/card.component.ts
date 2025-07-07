import { Component, Input, ContentChild, AfterContentInit, ElementRef } from '@angular/core';
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
export class CardComponent implements AfterContentInit {
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
  @Input() cardClass: string = '';
  @Input() variant: 'default' | 'elevated' | 'flat' = 'default';
  @Input() color: 'default' | 'primary' | 'accent' | 'warn' = 'default';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() state: 'default' | 'error' | 'empty' | 'success' = 'default';
  @Input() ariaLabel?: string;

  // Slots avanzados
  @ContentChild('cardHeader', { static: false, read: ElementRef }) cardHeaderSlot?: ElementRef;
  @ContentChild('cardError', { static: false, read: ElementRef }) cardErrorSlot?: ElementRef;
  @ContentChild('cardEmpty', { static: false, read: ElementRef }) cardEmptySlot?: ElementRef;
  @ContentChild('cardLoading', { static: false, read: ElementRef }) cardLoadingSlot?: ElementRef;

  hasProjectedHeader = false;
  hasProjectedError = false;
  hasProjectedEmpty = false;
  hasProjectedLoading = false;

  ngAfterContentInit(): void {
    this.hasProjectedHeader = !!this.cardHeaderSlot;
    this.hasProjectedError = !!this.cardErrorSlot;
    this.hasProjectedEmpty = !!this.cardEmptySlot;
    this.hasProjectedLoading = !!this.cardLoadingSlot;
  }
}
