import { APP_INITIALIZER, Provider } from '@angular/core';
import { catchError, of } from 'rxjs';
import { AuthService } from './auth';

function initializeAuth(authService: AuthService): () => Promise<void> {
  return () => {
    if (!authService.token) {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      authService.fetchCurrentUser().pipe(
        catchError(() => of(null)), // silently handle expired tokens
      ).subscribe(() => resolve());
    });
  };
}

export const authInitializerProvider: Provider = {
  provide:    APP_INITIALIZER,
  useFactory: (authService: AuthService) => initializeAuth(authService),
  deps:       [AuthService],
  multi:      true,
};
