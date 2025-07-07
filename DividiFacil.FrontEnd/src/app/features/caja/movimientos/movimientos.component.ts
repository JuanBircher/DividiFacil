import { Component } from '@angular/core';
import { CardComponent } from '../../../shared/components/card/card.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movimientos',
  imports: [
    CommonModule,
    MatIconModule,
    CardComponent
  ],
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.scss']
})
export class MovimientosComponent {

}
