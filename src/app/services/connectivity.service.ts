import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

/**
 * Browser online/offline signal for intermittent mobile connectivity.
 * Optimistic writes must gate on {@link online}; reads may still serve SWR stale.
 * {@link reconnectGeneration} bumps on each offline→online transition so pages
 * can revalidate honestly instead of painting forever-stale data.
 */
@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly online = signal(
    !isPlatformBrowser(this.platformId) ||
      (typeof navigator !== 'undefined' ? navigator.onLine : true),
  );

  /** Increments on each reconnect — subscribe via effect to auto-refresh. */
  readonly reconnectGeneration = signal(0);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
  }

  private readonly onOnline = (): void => {
    const wasOffline = !this.online();
    this.online.set(true);
    if (wasOffline) {
      this.reconnectGeneration.update((n) => n + 1);
    }
  };

  private readonly onOffline = (): void => {
    this.online.set(false);
  };
}
