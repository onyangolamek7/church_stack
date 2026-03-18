import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);

  // Only attach token for requests to our own API
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  if (!isApiRequest) {
    return next(req);
  }

  const token = authService.token;

  const authReq = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        authService.forceLogout();
      }
      return throwError(() => err);
    }),
  );
};

/*export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('auth_token');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
*/
