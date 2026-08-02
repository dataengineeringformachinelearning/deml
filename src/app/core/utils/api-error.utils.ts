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
        return 'Your session expired. Sign in again and retry.';
      }
      if (code === 'account_required') {
        return 'Your account is not fully provisioned yet. Finish sign-in and try again.';
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
    if (err.status === 403) {
      return (
        'Permission denied. Saving sites requires multi-factor authentication (MFA). ' +
        'Enroll MFA under Account, then sign out and sign back in to complete verification.'
      );
    }
    if (err.status === 404) {
      return 'Status page not found. Refresh the Sites page and try again.';
    }
    if (err.status === 401) {
      return 'Your session expired. Sign in again and retry.';
    }
  }
  return fallback;
}
