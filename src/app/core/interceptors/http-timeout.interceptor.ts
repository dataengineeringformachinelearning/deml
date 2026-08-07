import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { timeout } from 'rxjs';

import { environment } from '../../../environments/environment';

/** Default per-request budget for DEML BFF calls (aligns with FORJD client ~20s). */
export const DEFAULT_HTTP_TIMEOUT_MS = 20_000;

/**
 * Override the interceptor budget for a single request.
 * Status reads should exceed BFF GET retry budget (3 × ~20s worst case).
 */
export const HTTP_TIMEOUT_MS = new HttpContextToken<number>(() => DEFAULT_HTTP_TIMEOUT_MS);

/**
 * Apply a hard timeout to backend API calls.
 * Prevents hung fetches from leaving the SPA in perpetual loading.
 */
export const httpTimeoutInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.backendUrl)) {
    return next(req);
  }
  const ms = req.context.get(HTTP_TIMEOUT_MS);
  return next(req).pipe(timeout({ first: ms }));
};
