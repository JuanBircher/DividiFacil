import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { PlanHelperService } from '../helpers/plan-helper.service';

export function planGuardFactory(requiredPlan: 'free' | 'premium' | 'pro'): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const planHelper = inject(PlanHelperService);
    const router = inject(Router);
    const usuario = authService.obtenerUsuario();

    if (!usuario) {
      router.navigate(['/login']);
      return false;
    }

    if (
      (requiredPlan === 'premium' && (planHelper.esPremium(usuario) || planHelper.esPro(usuario))) ||
      (requiredPlan === 'pro' && planHelper.esPro(usuario)) ||
      (requiredPlan === 'free')
    ) {
      return true;
    }

    // Redirige a página de upgrade o muestra mensaje
    router.navigate(['/upgrade']);
    return false;
  };
}