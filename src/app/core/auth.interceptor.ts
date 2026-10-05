import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Attaches the Firebase ID token as a Bearer token on every API call — the UI never handles a
 * password directly for any provider (AUTH-1/AUTH-2). The API Gateway is the actual resource
 * server that validates this token; see docs/moomatch-HLD.md #Security.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  if (!req.url.includes('/api/')) {
    return next(req);
  }

  return from(auth.getIdToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }
      const authorizedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(authorizedReq);
    }),
  );
};
