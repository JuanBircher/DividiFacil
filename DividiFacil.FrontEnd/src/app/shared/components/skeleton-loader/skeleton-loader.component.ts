import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-loader" [ngClass]="type">
      <div class="skeleton-item" 
           *ngFor="let item of items; trackBy: trackByIndex"
           [style.height.px]="height">
      </div>
    </div>
  `,
  styles: [`
    .skeleton-loader {
      padding: 1rem;
    }
    
    .skeleton-item {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    .card-skeleton .skeleton-item {
      height: 120px;
      margin-bottom: 1rem;
    }
    
    .list-skeleton .skeleton-item {
      height: 60px;
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: 'card' | 'list' | 'text' = 'card';
  @Input() count: number = 3;
  @Input() height: number = 120;
  
  get items(): number[] {
    return Array(this.count).fill(0);
  }
  
  trackByIndex(index: number): number {
    return index;
  }
}