import { TestBed } from '@angular/core/testing';
import { GuardResult, MaybeAsync, Router, provideRouter } from '@angular/router';
import { firstValueFrom, isObservable } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

async function resolveGuardResult(result: MaybeAsync<GuardResult>): Promise<GuardResult> {
  return isObservable(result) ? firstValueFrom(result) : await result;
}

describe('authGuard', () => {
  it('redirects unauthenticated users to login with returnUrl', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isInitialized: () => true,
            isAuthenticated: () => false,
            isProcessing: () => false,
            waitForSessionReady: vi.fn(async () => false),
          },
        },
      ],
    });

    const router = TestBed.inject(Router);
    const result = await resolveGuardResult(
      TestBed.runInInjectionContext(() =>
        authGuard({} as never, { url: '/settings?section=sites' } as never),
      ),
    );

    expect(result).toEqual(
      router.createUrlTree(['/login'], {
        queryParams: { returnUrl: '/settings?section=sites' },
      }),
    );
  });

  it('allows authenticated users through', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isInitialized: () => true,
            isAuthenticated: () => true,
            isProcessing: () => false,
            waitForSessionReady: vi.fn(async () => true),
          },
        },
      ],
    });

    const result = await resolveGuardResult(
      TestBed.runInInjectionContext(() =>
        authGuard({} as never, { url: '/settings' } as never),
      ),
    );

    expect(result).toBe(true);
  });

  it('waits for an in-flight session bind before allowing Settings', async () => {
    const waitForSessionReady = vi.fn(async () => true);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isInitialized: () => true,
            isAuthenticated: () => false,
            isProcessing: () => true,
            waitForSessionReady,
          },
        },
      ],
    });

    const result = await resolveGuardResult(
      TestBed.runInInjectionContext(() =>
        authGuard({} as never, { url: '/settings' } as never),
      ),
    );

    expect(waitForSessionReady).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
