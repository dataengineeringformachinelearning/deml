import { Injectable, signal } from '@angular/core';

export type DialogKind = 'confirm' | 'alert';

export type ConfirmDialogData = {
  title: string;
  message?: string;
  confirmBtnText?: string;
  cancelBtnText?: string;
  type?: string;
};

export type ActiveDialog = {
  kind: DialogKind;
  data?: ConfirmDialogData;
};

@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly active = signal<ActiveDialog | null>(null);
  private confirmResolver: ((value: boolean) => void) | null = null;

  async confirm(options: { title: string; body?: string; confirmLabel?: string }): Promise<boolean> {
    return this.openConfirm({
      title: options.title,
      message: options.body,
      confirmBtnText: options.confirmLabel ?? 'Confirm',
      cancelBtnText: 'Cancel',
      type: 'confirm',
    });
  }

  openConfirm(data: ConfirmDialogData): Promise<boolean> {
    this.active.set({ kind: 'confirm', data });
    return new Promise<boolean>((resolve) => {
      this.confirmResolver = resolve;
      if (typeof globalThis.confirm === 'function') {
        const ok = globalThis.confirm([data.title, data.message].filter(Boolean).join('\n\n'));
        this.resolveConfirm(ok);
      }
    });
  }

  resolveConfirm(value: boolean): void {
    const resolver = this.confirmResolver;
    this.confirmResolver = null;
    this.active.set(null);
    resolver?.(value);
  }
}
