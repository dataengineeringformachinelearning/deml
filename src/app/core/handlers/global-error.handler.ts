import { ErrorHandler, Injectable, Injector, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment';
import { isChunkLoadError, reloadOnceOnChunkError } from '../chunk-load-recovery';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);

  handleError(error: unknown): void {
    if (isPlatformBrowser(this.platformId) && reloadOnceOnChunkError(error)) {
      return;
    }

    // Browser extensions (Angular DevTools) throw into the app error channel on prod.
    if (isIgnoredClientNoise(error)) {
      return;
    }

    void this.captureInMonitoring(error);
    console.error('GlobalErrorHandler caught an error:', error);

    if (isPlatformBrowser(this.platformId) && !isChunkLoadError(error)) {
      queueMicrotask(() => {
        this.injector.get(ToastService).show({
          heading: 'System Error',
          text: 'An unexpected system error occurred. Please try again later.',
          tone: 'danger',
          duration: 6000,
        });
      });
    }
  }

  private async captureInMonitoring(error: unknown): Promise<void> {
    if (
      (!environment.sentryDsn && !environment.rollbarAccessToken) ||
      !isPlatformBrowser(this.platformId)
    ) {
      return;
    }
    // Chunk skew storms Sentry/Rollbar; recovery reload handles it locally.
    if (isChunkLoadError(error)) {
      return;
    }

    try {
      const { captureMonitoringException } = await import('../monitoring/monitoring.facade');
      await captureMonitoringException(error, {
        dsn: environment.sentryDsn,
        rollbarAccessToken: environment.rollbarAccessToken,
        environment: environment.production ? 'production' : 'development',
      });
    } catch {
      // Error reporting must never create a second application failure.
    }
  }
}

// --- Extension / tooling noise (not app defects) ---
function isIgnoredClientNoise(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : String((error as { message?: unknown })?.message ?? error ?? '');
  return (
    message.includes('Angular DevTools') ||
    message.includes('Angular debugging APIs are not available')
  );
}
