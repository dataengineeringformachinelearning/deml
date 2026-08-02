import { Injectable, signal } from '@angular/core';

export type ToastPayload = {
  heading?: string;
  title?: string;
  text?: string;
  message?: string;
  tone?: string;
  duration?: number;
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly latest = signal<ToastPayload | null>(null);

  show(payload: ToastPayload): void {
    this.latest.set(payload);
    if (typeof console !== 'undefined') {
      console.info('[toast]', payload.heading ?? payload.title ?? '', payload.text ?? payload.message ?? '');
    }
  }
}
