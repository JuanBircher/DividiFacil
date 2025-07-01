import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ValidationUtil {
  
  /**
   * Validador de email personalizado
   */
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(value) ? null : { invalidEmail: true };
    };
  }

  /**
   * Validador de contraseña fuerte
   */
  static strongPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isValidLength = value.length >= 8;
      
      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && isValidLength;
      
      return passwordValid ? null : {
        weakPassword: {
          hasUpperCase,
          hasLowerCase,
          hasNumeric,
          hasSpecialChar,
          isValidLength
        }
      };
    };
  }

  /**
   * Validador de monto positivo
   */
  static positiveAmountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') return null;
      
      const numericValue = parseFloat(value);
      return numericValue > 0 ? null : { notPositive: true };
    };
  }

  /**
   * Validador de teléfono argentino
   */
  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      // Formato: +54 9 11 1234-5678 o variaciones
      const phoneRegex = /^(\+54|54)?[\s]?9?[\s]?(11|[2-9]\d{1,3})[\s]?\d{3,4}[\s-]?\d{4}$/;
      return phoneRegex.test(value.replace(/\s/g, '')) ? null : { invalidPhone: true };
    };
  }

  /**
   * Obtener mensajes de error en español
   */
  static getErrorMessage(errors: ValidationErrors, fieldName: string = 'campo'): string {
    if (errors['required']) return `El ${fieldName} es requerido`;
    if (errors['invalidEmail']) return 'El email no tiene un formato válido';
    if (errors['minlength']) return `El ${fieldName} debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `El ${fieldName} no puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['notPositive']) return `El ${fieldName} debe ser mayor a 0`;
    if (errors['invalidPhone']) return 'El teléfono no tiene un formato válido';
    if (errors['weakPassword']) {
      const requirements = [];
      if (!errors['weakPassword'].hasUpperCase) requirements.push('mayúscula');
      if (!errors['weakPassword'].hasLowerCase) requirements.push('minúscula');
      if (!errors['weakPassword'].hasNumeric) requirements.push('número');
      if (!errors['weakPassword'].hasSpecialChar) requirements.push('símbolo especial');
      if (!errors['weakPassword'].isValidLength) requirements.push('8 caracteres mínimo');
      return `La contraseña debe contener: ${requirements.join(', ')}`;
    }
    
    return `El ${fieldName} es inválido`;
  }
}