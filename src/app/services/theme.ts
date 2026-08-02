import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'deml-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly theme = signal<ThemeMode>(this.readInitialTheme());
  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    afterNextRender(() => {
      this.applyTheme(this.theme());
    });
  }

  toggle(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
    this.applyTheme(mode);
  }

  private readInitialTheme(): ThemeMode {
    if (!this.isBrowser) {
      return 'dark';
    }

    const stored = this.document.documentElement.getAttribute('data-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    try {
      const fromStorage = localStorage.getItem(STORAGE_KEY);
      if (fromStorage === 'light' || fromStorage === 'dark') {
        return fromStorage;
      }
    } catch {
      /* ignore storage access errors */
    }

    const prefersLight = this.document.defaultView?.matchMedia?.(
      '(prefers-color-scheme: light)',
    )?.matches;
    return prefersLight ? 'light' : 'dark';
  }

  private applyTheme(mode: ThemeMode): void {
    if (!this.isBrowser) {
      return;
    }

    const root = this.document.documentElement;
    root.setAttribute('data-theme', mode);
    root.style.colorScheme = mode;

    const themeColor = this.document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', mode === 'dark' ? '#322F2C' : '#CFC9C2');
    }

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore storage access errors */
    }
  }
}
