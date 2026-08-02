import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { DialogService } from './dialog.service';

type OnboardingStore = {
  getCompletedSteps: () => string[];
  completeStep: (id: string) => void;
  reset: () => void;
};

const storageKey = 'deml-onboarding';

function getDefaultOnboardingStore(): OnboardingStore {
  const read = (): string[] => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  };
  const write = (steps: string[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(steps));
    } catch {
      /* ignore */
    }
  };
  return {
    getCompletedSteps: read,
    completeStep: (id: string) => {
      const next = Array.from(new Set([...read(), id]));
      write(next);
    },
    reset: () => write([]),
  };
}

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly dialog = inject(DialogService);
  private readonly platformId = inject(PLATFORM_ID);
  private store: OnboardingStore | null = null;

  private getStore(): OnboardingStore | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    if (!this.store) {
      this.store = getDefaultOnboardingStore();
    }
    return this.store;
  }

  getCompletedSteps(): string[] {
    return this.getStore()?.getCompletedSteps() ?? [];
  }

  completeStep(id: string): void {
    this.getStore()?.completeStep(id);
  }

  reset(): void {
    this.getStore()?.reset();
  }

  async confirmReset(): Promise<boolean> {
    const ok = await this.dialog.confirm({
      title: 'Reset onboarding?',
      body: 'This clears completed checklist steps for this browser.',
      confirmLabel: 'Reset',
    });
    if (ok) {
      this.reset();
    }
    return ok;
  }
}
