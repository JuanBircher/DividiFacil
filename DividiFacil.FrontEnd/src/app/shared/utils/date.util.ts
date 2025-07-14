export class DateUtil {
  /**
   * Obtener fecha local en formato YYYY-MM-DD (sin desfase UTC)
   */
  static getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Formatear fecha para input datetime-local
   */
  static toDateTimeLocal(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().slice(0, 16);
  }

  /**
   * Obtener inicio del mes actual
   */
  static getStartOfMonth(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * Obtener fin del mes actual
   */
  static getEndOfMonth(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  }

  /**
   * Obtener inicio de la semana
   */
  static getStartOfWeek(date: Date = new Date()): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  /**
   * Verificar si dos fechas son del mismo día
   */
  static isSameDay(date1: Date | string, date2: Date | string): boolean {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  /**
   * Obtener tiempo relativo (hace X tiempo)
   */
  static getRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInSec = Math.floor(diffInMs / 1000);
    const diffInMin = Math.floor(diffInSec / 60);
    const diffInHour = Math.floor(diffInMin / 60);
    const diffInDay = Math.floor(diffInHour / 24);

    if (diffInSec < 60) return 'Ahora';
    if (diffInMin < 60) return `Hace ${diffInMin} min`;
    if (diffInHour < 24) return `Hace ${diffInHour}h`;
    if (diffInDay < 7) return `Hace ${diffInDay}d`;
    
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  }

  /**
   * Validar si es una fecha válida
   */
  static isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }
}