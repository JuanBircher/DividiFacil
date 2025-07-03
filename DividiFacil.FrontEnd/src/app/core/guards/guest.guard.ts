import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  if (authService.estaLogueado()) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};