import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';
import { AuthService } from '../auth.service';


/**
 * Servicio helper para lógica de planes de usuario.
 * Permite verificar el tipo de plan y el acceso a funcionalidades.
 */
@Injectable({ providedIn: 'root' })
export class PlanHelperService {
  constructor() {}

  esFree(usuario: Usuario | null): boolean {
    return usuario?.plan?.toLowerCase() === 'Free';
  }

  esPremium(usuario: Usuario | null): boolean {
    return usuario?.plan?.toLowerCase() === 'Premium';
  }

  esPro(usuario: Usuario | null): boolean {
    return usuario?.plan?.toLowerCase() === 'Pro';
  }

  /**
   * Verifica si el usuario tiene acceso a una funcionalidad específica
   * @param usuario Usuario actual
   * @param feature Nombre de la funcionalidad (ej: 'exportar', 'reportes', 'grupos-ilimitados')
   */
  tieneAcceso(usuario: Usuario | null, feature: string): boolean {
    if (!usuario) return false;
    const plan = usuario.plan?.toLowerCase();
    // Ejemplo de lógica: puedes personalizar según tus reglas de negocio
    const featuresPorPlan: Record<string, string[]> = {
      free: ['gastos-basicos', 'grupos-limitados'],
      premium: ['gastos-basicos', 'grupos-ilimitados', 'reportes', 'exportar'],
      pro: ['gastos-basicos', 'grupos-ilimitados', 'reportes', 'exportar', 'soporte-prioritario']
    };
    return featuresPorPlan[plan]?.includes(feature) ?? false;
  }

  mostrarPush(usuario: Usuario | null): boolean {
    return this.esPremium(usuario) || this.esPro(usuario);
  }
}
