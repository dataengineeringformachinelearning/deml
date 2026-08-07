import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  effect,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

import { Button } from '../button/button';
import { ButtonGroup } from '../button-group/button-group';
import { Sheet } from '../sheet/sheet';
import { DialogService, type ActiveDialog } from '../../services/dialog.service';

/** Exit duration — keep in sync with deml-ui `--duration-fast`. */
const SHEET_EXIT_MS = 140;

/** Product confirm host — deml-ui bottom sheet (phone) / centered panel (md+). */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-confirm-sheet',
  imports: [Button, ButtonGroup, Sheet],
  templateUrl: './confirm-sheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmSheet {
  private readonly dialog = inject(DialogService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Local display copy so exit animation can finish before dialog clears. */
  readonly visible = signal<ActiveDialog | null>(null);
  readonly leaving = signal(false);

  private previouslyFocused: HTMLElement | null = null;
  private exitTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingResult: boolean | null = null;

  constructor() {
    if (!this.isBrowser) {
      effect(() => {
        this.visible.set(this.dialog.active());
      });
      return;
    }

    effect(() => {
      const next = this.dialog.active();
      if (next?.kind === 'confirm') {
        this.clearExitTimer();
        this.leaving.set(false);
        this.visible.set(next);
        this.document.body.style.overflow = 'hidden';
        this.setMainInert(true);
        this.previouslyFocused = this.document.activeElement as HTMLElement | null;
        queueMicrotask(() => this.focusPrimaryAction());
        return;
      }

      // Service cleared externally — animate out if still showing.
      if (this.visible() !== null && !this.leaving()) {
        this.beginClose(false, false);
      }
    });

    fromEvent<KeyboardEvent>(this.document, 'keydown')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (!this.visible() || this.leaving()) {
          return;
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          this.cancel();
          return;
        }
        if (event.key === 'Tab') {
          this.trapFocus(event);
        }
      });

    this.destroyRef.onDestroy(() => {
      this.clearExitTimer();
      this.document.body.style.overflow = '';
      this.setMainInert(false);
    });
  }

  confirm(): void {
    this.beginClose(true, true);
  }

  cancel(): void {
    this.beginClose(false, true);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  private beginClose(value: boolean, resolveService: boolean): void {
    if (this.leaving() || !this.visible()) {
      return;
    }

    this.pendingResult = value;
    this.leaving.set(true);

    const finish = () => {
      this.clearExitTimer();
      this.visible.set(null);
      this.leaving.set(false);
      this.document.body.style.overflow = '';
      this.setMainInert(false);

      if (resolveService) {
        this.dialog.resolveConfirm(value);
      }

      if (this.previouslyFocused) {
        const restore = this.previouslyFocused;
        this.previouslyFocused = null;
        queueMicrotask(() => restore.focus?.());
      }

      this.pendingResult = null;
    };

    const reduceMotion =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      finish();
      return;
    }

    this.exitTimer = setTimeout(finish, SHEET_EXIT_MS);
  }

  private clearExitTimer(): void {
    if (this.exitTimer !== null) {
      clearTimeout(this.exitTimer);
      this.exitTimer = null;
    }
  }

  private sheetPanelEl(): HTMLElement | null {
    return this.host.nativeElement.querySelector('.sheet');
  }

  private focusPrimaryAction(): void {
    const panel = this.sheetPanelEl();
    if (!panel) {
      return;
    }
    const primary =
      (panel.querySelector(
        'button.button--primary, button.button--accent, [data-confirm-primary]',
      ) as HTMLElement | null) ??
      (panel.querySelector('button:not([disabled])') as HTMLElement | null);
    primary?.focus();
  }

  private trapFocus(event: KeyboardEvent): void {
    const panel = this.sheetPanelEl();
    if (!panel) {
      return;
    }
    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((node) => {
      const style = getComputedStyle(node);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    if (focusables.length === 0) {
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = this.document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private setMainInert(inert: boolean): void {
    const main = this.document.getElementById('main-content');
    if (!main) {
      return;
    }
    if (inert) {
      main.setAttribute('inert', '');
    } else {
      main.removeAttribute('inert');
    }
  }
}
