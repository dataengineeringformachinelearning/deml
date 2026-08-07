import { Injectable, signal } from '@angular/core';

export type DialogKind = 'confirm' | 'alert';

export type ConfirmDialogData = {
  title: string;
  message?: string;
  confirmBtnText?: string;
  cancelBtnText?: string;
  type?: string;
  /** Danger confirms use accent (destructive) primary action. */
  tone?: 'default' | 'danger';
};

export type ActiveDialog = {
  kind: DialogKind;
  data?: ConfirmDialogData;
};

/** Signal-driven confirm — resolved by app-confirm-sheet (no native window.confirm). */
@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly active = signal<ActiveDialog | null>(null);
  private confirmResolver: ((value: boolean) => void) | null = null;

  async confirm(options: {
    title: string;
    body?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: 'default' | 'danger';
  }): Promise<boolean> {
    return this.openConfirm({
      title: options.title,
      message: options.body,
      confirmBtnText: options.confirmLabel ?? 'Confirm',
      cancelBtnText: options.cancelLabel ?? 'Cancel',
      type: 'confirm',
      tone: options.tone ?? 'default',
    });
  }

  openConfirm(data: ConfirmDialogData): Promise<boolean> {
    this.resolveConfirm(false);
    this.active.set({ kind: 'confirm', data });
    return new Promise<boolean>((resolve) => {
      this.confirmResolver = resolve;
    });
  }

  resolveConfirm(value: boolean): void {
    const resolver = this.confirmResolver;
    this.confirmResolver = null;
    this.active.set(null);
    resolver?.(value);
  }
}
