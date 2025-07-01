import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  
  transform(value: string | Date | null | undefined, format: 'short' | 'medium' | 'long' | 'relative' = 'medium'): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    switch (format) {
      case 'short':
        return date.toLocaleDateString('es-AR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: '2-digit' 
        });
      
      case 'medium':
        return date.toLocaleDateString('es-AR', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        });
      
      case 'long':
        return date.toLocaleDateString('es-AR', { 
          weekday: 'long',
          day: '2-digit', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      
      case 'relative':
        if (diffInDays === 0) return 'Hoy';
        if (diffInDays === 1) return 'Ayer';
        if (diffInDays < 7) return `Hace ${diffInDays} días`;
        if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
      
      default:
        return date.toLocaleDateString('es-AR');
    }
  }
}