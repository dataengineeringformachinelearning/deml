import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

/**
 * Browser online/offline signal for intermittent mobile connectivity.
 * Optimistic writes must gate on {@link online}; reads may still serve SWR stale.
 */
@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly online = signal(
    !isPlatformBrowser(this.platformId) ||
      (typeof navigator !== 'undefined' ? navigator.onLine : true),
  );

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
  }

  private readonly onOnline = (): void => {
    this.online.set(true);
  };

  private readonly onOffline = (): void => {
    this.online.set(false);
  };
}
