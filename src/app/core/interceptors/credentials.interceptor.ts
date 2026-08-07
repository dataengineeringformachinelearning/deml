import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

/** Skip Firebase/session headers (public explore directory, public slug reads). */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

const ID_TOKEN_TIMEOUT_MS = 15_000;

function authUnavailable(url: string): HttpErrorResponse {
  return new HttpErrorResponse({
    status: 401,
    statusText: 'Unauthorized',
    url,
    error: { detail: 'Sign-in token unavailable', code: 'authentication_required' },
  });
}

/**
 * Attach Firebase Bearer + DEML session for backend API calls when signed in.
 * Public status directory reads set SKIP_AUTH so Explore stays cross-tenant.
 *
 * Fail closed: if the user is authenticated but the ID token cannot be obtained,
 * do not send an authed-looking request without credentials (silent 401 risk).
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
    return throwError(() => authUnavailable(req.url));
  }

  return from(firebaseUser.getIdToken()).pipe(
    timeout({ first: ID_TOKEN_TIMEOUT_MS }),
    switchMap(token => {
      if (!token) {
        return throwError(() => authUnavailable(req.url));
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
    catchError(err => {
      if (err instanceof HttpErrorResponse) {
        return throwError(() => err);
      }
      return throwError(() => authUnavailable(req.url));
    }),
  );
};
