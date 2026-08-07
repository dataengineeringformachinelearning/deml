import { HttpErrorResponse } from '@angular/common/http';

/** Extract a user-facing message from a Django Ninja / Angular HTTP error. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body && typeof body === 'object') {
      const record = body as Record<string, unknown>;
      const code = typeof record['code'] === 'string' ? record['code'] : '';

      // --- Known DEML / FORJD policy codes (prefer over raw detail) ---
      if (code === 'forjd_action_forbidden') {
        return (
          'Your account role cannot perform this action. ' +
          'Site and status-page changes require Operator or Security Admin.'
        );
      }
      if (code === 'pro_required') {
        return 'This action requires an active Pro subscription.';
      }
      if (code === 'authentication_required') {
        return 'Your session expired. Log in again and retry.';
      }
      if (code === 'account_required') {
        return 'Your account is not fully provisioned yet. Finish logging in and try again.';
      }

      const detail = record['detail'];
      if (typeof detail === 'string' && detail) {
        return detail;
      }
      const message = record['message'];
      if (typeof message === 'string' && message) {
        return message;
      }
      const error = record['error'];
      if (typeof error === 'string' && error) {
        return error;
      }
    }
    if (err.status === 409) {
      return 'A site with that slug already exists. Choose another slug or edit the existing site.';
    }
    if (err.status === 403) {
      return (
        'Permission denied. Site and status-page changes require Operator or Security Admin.'
      );
    }
    if (err.status === 404) {
      return 'Status page not found. Refresh Settings and try again.';
    }
    if (err.status === 401) {
      return 'Your session expired. Log in again and retry.';
    }
    if (err.status === 0 || err.status === 504) {
      return 'Network timeout or offline. Check your connection, then retry.';
    }
  }
  if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'TimeoutError') {
    return 'Request timed out. Check your connection, then retry.';
  }
  return fallback;
}
