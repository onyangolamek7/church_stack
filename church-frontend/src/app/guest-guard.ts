import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth';
import { map, take } from 'rxjs';

export const guestGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return router.createUrlTree(['/hymns']);
      }
      return true;
    }),
  );
};
