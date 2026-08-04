import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

/** Skip Firebase/session headers (public explore directory, public slug reads). */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

/**
 * Attach Firebase Bearer + DEML session for backend API calls when signed in.
 * Public status directory reads set SKIP_AUTH so Explore stays cross-tenant.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH)) {
    return next(req);
  }
  if (!req.url.startsWith(environment.backendUrl)) {
    return next(req);
  }

  const auth = inject(AuthService);
  if (!auth.isAuthenticated()) {
    return next(req);
  }

  const firebaseUser = auth.auth?.currentUser;
  if (!firebaseUser || typeof firebaseUser.getIdToken !== 'function') {
    return next(req);
  }

  return from(firebaseUser.getIdToken()).pipe(
    switchMap(token => {
      if (!token) {
        return next(req);
      }
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };
      const sessionId = auth.sessionId();
      if (sessionId) {
        headers['X-DEML-Session-Id'] = sessionId;
      }
      return next(req.clone({ setHeaders: headers }));
    }),
  );
};
