import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  effect,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

import { Button } from '../button/button';
import { ButtonGroup } from '../button-group/button-group';
import { DialogService } from '../../services/dialog.service';

/** Product confirm host — deml-ui bottom sheet (phone) / centered panel (md+). */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-confirm-sheet',
  imports: [Button, ButtonGroup],
  templateUrl: './confirm-sheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmSheet {
  private readonly dialog = inject(DialogService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly active = this.dialog.active;

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    effect(() => {
      const open = this.active()?.kind === 'confirm';
      document.body.style.overflow = open ? 'hidden' : '';
    });

    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event.key === 'Escape' && this.active()?.kind === 'confirm') {
          event.preventDefault();
          this.cancel();
        }
      });

    this.destroyRef.onDestroy(() => {
      document.body.style.overflow = '';
    });
  }

  confirm(): void {
    this.dialog.resolveConfirm(true);
  }

  cancel(): void {
    this.dialog.resolveConfirm(false);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }
}
