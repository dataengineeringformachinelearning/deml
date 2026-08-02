import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Opens the app command palette when handlers are registered. */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly platformId = inject(PLATFORM_ID);
  private openPaletteHandler: (() => void) | null = null;
  private closePaletteHandler: (() => void) | null = null;

  registerHandlers(open: () => void, close: () => void): void {
    this.openPaletteHandler = open;
    this.closePaletteHandler = close;
  }

  clearHandlers(): void {
    this.openPaletteHandler = null;
    this.closePaletteHandler = null;
  }

  open(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.openPaletteHandler?.();
  }

  close(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.closePaletteHandler?.();
  }
}
