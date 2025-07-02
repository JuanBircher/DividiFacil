import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const tokenGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  const token = localStorage.getItem('token');
  
  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }
  
  return true;
};