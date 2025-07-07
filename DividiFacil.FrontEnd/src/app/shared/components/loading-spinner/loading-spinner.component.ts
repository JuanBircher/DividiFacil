import { Component, Input, ContentChild, AfterContentInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ]
})
export class LoadingSpinnerComponent implements AfterContentInit {
  @Input() diameter: number = 40;
  @Input() strokeWidth: number = 4;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() message: string = 'Cargando...';
  @Input() showMessage: boolean = true;
  @Input() overlay: boolean = false;
  @Input() ariaLabel: string = 'Cargando';
  @Input() variant: 'default' | 'inline' | 'centered' = 'default';

  @ContentChild('spinnerIcon', { static: false, read: ElementRef }) spinnerIconSlot?: ElementRef;
  @ContentChild('spinnerMessage', { static: false, read: ElementRef }) spinnerMessageSlot?: ElementRef;

  hasProjectedIcon = false;
  hasProjectedMessage = false;

  ngAfterContentInit(): void {
    this.hasProjectedIcon = !!this.spinnerIconSlot;
    this.hasProjectedMessage = !!this.spinnerMessageSlot;
  }
}
