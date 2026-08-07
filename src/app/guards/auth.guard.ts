import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, from, map, switchMap, take } from 'rxjs';

import { AuthService } from '../services/auth.service';

const loginTree = (router: Router, returnUrl: string) =>
  router.createUrlTree(['/login'], {
    queryParams: returnUrl && returnUrl !== '/login' ? { returnUrl } : undefined,
  });

/**
 * Fail closed for Settings: wait for init, and if a bind is in flight wait for
 * session readiness so we never bounce a successful login back to /login.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const returnUrl = state.url || '/settings';

  const whenReady = async (): Promise<boolean> => {
    if (authService.isAuthenticated()) {
      return true;
    }
    if (authService.isProcessing()) {
      // Align with login bind budget (auth/user ~20s + session register ~15s).
      return authService.waitForSessionReady(25_000);
    }
    return false;
  };

  if (authService.isInitialized()) {
    return from(whenReady()).pipe(
      map((ok) => (ok ? true : loginTree(router, returnUrl))),
    );
  }

  return toObservable(authService.isInitialized).pipe(
    filter((initialized) => initialized),
    take(1),
    switchMap(() => from(whenReady())),
    map((ok) => (ok ? true : loginTree(router, returnUrl))),
  );
};
