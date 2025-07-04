import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  // Verificar si está logueado Y si el token no ha expirado
  if (authService.estaLogueado() && !authService.tokenExpirado()) {
    return true;
  } else {
    // Limpiar sesión y redirigir
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.navigate(['/auth/login']);
    return false;
  }
};