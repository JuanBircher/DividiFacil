import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status',
  standalone: true
})
export class StatusPipe implements PipeTransform {
  
  private readonly statusTranslations: { [key: string]: string } = {
    // Estados de pago
    'Pendiente': 'Pendiente',
    'Completado': 'Completado',
    'Rechazado': 'Rechazado',
    
    // Estados de miembro
    'Activo': 'Activo',
    'Inactivo': 'Inactivo',
    
    // Roles
    'Administrador': 'Admin',
    'Miembro': 'Miembro',
    
    // Estados booleanos
    'true': 'Sí',
    'false': 'No',
    
    // Estados de notificación
    'GASTO_CREADO': 'Nuevo Gasto',
    'PAGO_RECIBIDO': 'Pago Recibido',
    'PAGO_SOLICITADO': 'Pago Solicitado',
    'RECORDATORIO': 'Recordatorio',
    'GRUPO_INVITACION': 'Invitación'
  };

  transform(value: string | boolean | null | undefined): string {
    if (value === null || value === undefined) return '';
    
    const stringValue = value.toString();
    return this.statusTranslations[stringValue] || stringValue;
  }
}