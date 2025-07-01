export class CurrencyUtil {
  
  /**
   * Formatear monto a string con separadores
   */
  static formatAmount(amount: number | string, currency: string = 'ARS'): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) return '$0.00';
    
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
  }

  /**
   * Parsear string de monto a número
   */
  static parseAmount(amountString: string): number {
    if (!amountString) return 0;
    
    // Remover símbolos de moneda y espacios
    const cleaned = amountString.replace(/[^\d.,]/g, '');
    // Convertir coma decimal a punto
    const normalized = cleaned.replace(',', '.');
    
    return parseFloat(normalized) || 0;
  }

  /**
   * Validar si un monto es válido
   */
  static isValidAmount(amount: any): boolean {
    const numericAmount = typeof amount === 'string' ? this.parseAmount(amount) : amount;
    return !isNaN(numericAmount) && numericAmount >= 0;
  }

  /**
   * Calcular porcentaje de un monto
   */
  static calculatePercentage(amount: number, percentage: number): number {
    return (amount * percentage) / 100;
  }

  /**
   * Dividir monto entre N personas
   */
  static divideBetween(amount: number, people: number): number {
    if (people <= 0) return 0;
    return Math.round((amount / people) * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Sumar array de montos
   */
  static sum(amounts: number[]): number {
    return amounts.reduce((total, amount) => total + (amount || 0), 0);
  }

  /**
   * Formatear para input numérico
   */
  static formatForInput(value: number): string {
    return value.toFixed(2);
  }
}