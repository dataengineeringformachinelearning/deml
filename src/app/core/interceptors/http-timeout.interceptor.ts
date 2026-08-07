import { HttpInterceptorFn } from '@angular/common/http';
import { timeout } from 'rxjs';

import { environment } from '../../../environments/environment';

/** Default per-request budget for DEML BFF calls (aligns with FORJD client ~20s). */
export const DEFAULT_HTTP_TIMEOUT_MS = 20_000;

/**
 * Apply a hard timeout to backend API calls that do not already specify one.
 * Prevents hung fetches from leaving the SPA in perpetual loading.
 */
export const httpTimeoutInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.backendUrl)) {
    return next(req);
  }
  return next(req).pipe(timeout({ first: DEFAULT_HTTP_TIMEOUT_MS }));
};
