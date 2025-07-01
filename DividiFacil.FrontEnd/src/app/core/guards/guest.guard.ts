import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  // Si el usuario ya está logueado, lo enviamos al dashboard
  if (authService.estaLogueado()) {
    router.navigate(['/dashboard']);
    return false; // No permitir acceso a login/register
  }
  
  return true; // Permitir acceso si NO está logueado
};