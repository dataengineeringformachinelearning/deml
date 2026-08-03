import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DialogService } from './dialog.service';
import { OnboardingService } from './onboarding.service';

describe('OnboardingService', () => {
  const storageKey = 'deml-onboarding';

  beforeEach(() => {
    localStorage.removeItem(storageKey);
    TestBed.configureTestingModule({
      providers: [
        OnboardingService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: DialogService,
          useValue: {
            confirm: vi.fn(() => Promise.resolve(true)),
          },
        },
      ],
    });
  });

  afterEach(() => {
    localStorage.removeItem(storageKey);
  });

  it('tracks completed steps in localStorage', () => {
    const svc = TestBed.inject(OnboardingService);
    expect(svc.getCompletedSteps()).toEqual([]);
    svc.completeStep('welcome');
    expect(svc.getCompletedSteps()).toContain('welcome');
  });

  it('reset clears completed steps', () => {
    const svc = TestBed.inject(OnboardingService);
    svc.completeStep('welcome');
    svc.reset();
    expect(svc.getCompletedSteps()).toEqual([]);
  });

  it('confirmReset uses DialogService and clears on confirm', async () => {
    const dialog = TestBed.inject(DialogService);
    const svc = TestBed.inject(OnboardingService);
    svc.completeStep('welcome');
    await expect(svc.confirmReset()).resolves.toBe(true);
    expect(dialog.confirm).toHaveBeenCalled();
    expect(svc.getCompletedSteps()).toEqual([]);
  });
});
