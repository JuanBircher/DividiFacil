// src/app/core/services/base.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  
  /**
   * Extrae un array de la respuesta del backend de .NET
   * @param response Respuesta del backend
   * @returns Array extraído o array vacío
   */
  protected extractArray<T>(response: any): T[] {
    // ✅ ESTRUCTURA ESPECÍFICA DE .NET CON $values
    if (response && response.data && response.data.$values && Array.isArray(response.data.$values)) {
      return response.data.$values;
    }
    
    // ✅ ESTRUCTURA SIMPLE CON data
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    // ✅ ESTRUCTURA DIRECTA CON $values
    if (response && response.$values && Array.isArray(response.$values)) {
      return response.$values;
    }
    
    // ✅ ARRAY DIRECTO
    if (Array.isArray(response)) {
      return response;
    }
    
    console.warn('🚨 Estructura de respuesta no reconocida:', response);
    return [];
  }

  /**
   * Extrae un objeto de la respuesta del backend
   * @param response Respuesta del backend
   * @returns Objeto extraído o null
   */
  protected extractObject<T>(response: any): T | null {
    // ✅ ESTRUCTURA CON data
    if (response && response.data) {
      return response.data;
    }
    
    // ✅ OBJETO DIRECTO
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      return response;
    }
    
    return null;
  }
}