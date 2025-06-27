import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  // Verifica si hay un token en localStorage
  const token = localStorage.getItem('token');
  if (token) {
    return true;
  } else {
    // Redirige a login si no está autenticado
    router.navigate(['/auth/login']);
    return false;
  }
};