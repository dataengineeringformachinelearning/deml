import { environment } from '../../../environments/environment';

/**
 * Stable DEML Django BFF paths used by the Angular product surface.
 *
 * Browser never calls FORJD and never holds ``fjsvc_`` tokens.
 * Core product uses status pages + auth/session only.
 */
export const API_ENDPOINTS = {
  SYSTEM_STATUS: {
    STATUS_PAGES: `${environment.backendUrl}/api/v1/system-status/status_pages`,
  },
};
