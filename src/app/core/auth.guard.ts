import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Every route is behind this except /login (per the frontend routing plan). */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // onAuthStateChanged resolves asynchronously on app boot; wait for the first resolution.
  while (auth.loading()) {
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
