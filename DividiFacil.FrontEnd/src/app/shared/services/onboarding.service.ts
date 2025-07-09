import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly STORAGE_KEY = 'onboardingCompleted';

  isOnboardingCompleted(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  completeOnboarding(): void {
    localStorage.setItem(this.STORAGE_KEY, 'true');
  }

  resetOnboarding(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
