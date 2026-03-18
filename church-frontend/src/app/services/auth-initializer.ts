// src/app/core/initializers/auth.initializer.ts

import { inject } from '@angular/core';
import { APP_INITIALIZER, Provider } from '@angular/core';
import { catchError, of } from 'rxjs';
import { AuthService } from './auth';

/**
 * Runs once on app startup.
 * If a token exists in localStorage, validates it against
 * the API and loads the user profile. If the token is
 * expired or invalid, the session is cleared gracefully.
 *
 * Register in app.config.ts:
 *   providers: [authInitializerProvider]
 */
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
