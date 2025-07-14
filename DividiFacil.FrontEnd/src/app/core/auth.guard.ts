import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  // console.log('[authGuard] ¿Está logueado?', authService.estaLogueado(), '¿Token expirado?', authService.tokenExpirado());
  
  // Verificar si está logueado Y si el token no ha expirado
  if (authService.estaLogueado() && !authService.tokenExpirado()) {
    // console.log('[authGuard] Permite acceso');
    return true;
  } else {
    // Limpiar sesión y redirigir
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    // console.log('[authGuard] Bloquea acceso, redirige a login');
    router.navigate(['/auth/login']);
    return false;
  }
};