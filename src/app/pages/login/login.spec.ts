import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap, provideRouter, Router, ActivatedRoute } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '../../services/auth.service';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let router: Router;
  let queryParams: Record<string, string>;
  const isAuthenticated = signal(false);
  const currentUserId = signal<number | null>(null);
  const authMock = {
    isAuthenticated,
    currentUserId,
    logout: vi.fn(async () => {
      isAuthenticated.set(false);
      currentUserId.set(null);
    }),
    login: vi.fn(
      async (): Promise<{
        success: boolean;
        error?: string;
        resolver?: unknown;
      }> => {
        isAuthenticated.set(true);
        currentUserId.set(1);
        return { success: true };
      },
    ),
    beginMfaChallenge: vi.fn(),
  };

  beforeEach(async () => {
    isAuthenticated.set(false);
    currentUserId.set(null);
    queryParams = {};
    authMock.login.mockClear();
    authMock.logout.mockClear();
    authMock.beginMfaChallenge.mockClear();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([
          { path: 'dashboard', children: [] },
          { path: 'settings', children: [] },
          { path: 'mfa', children: [] },
        ]),
        { provide: AuthService, useValue: authMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              get queryParamMap() {
                return convertToParamMap(queryParams);
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create a centered login form', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance).toBeTruthy();
    expect(host.querySelector('app-form-panel')).toBeTruthy();
    expect(host.querySelector('form.form-panel__form')).toBeTruthy();
    expect(host.querySelector('h1')?.textContent).toContain('Log in');
  });

  it('should show validation errors when submitted empty', async () => {
    const host = fixture.nativeElement as HTMLElement;
    host.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.emailError()).toContain('email');
    expect(fixture.componentInstance.passwordError()).toContain('password');
    expect(authMock.isAuthenticated()).toBe(false);
    expect(authMock.login).not.toHaveBeenCalled();
  });

  it('should log in and navigate to the dashboard by default', async () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const component = fixture.componentInstance;

    component.email.set('ada@example.com');
    component.password.set('secret123');
    await component.submit(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authMock.login).toHaveBeenCalledWith({
      username: 'ada@example.com',
      password: 'secret123',
    });
    expect(authMock.isAuthenticated()).toBe(true);
    expect(authMock.currentUserId()).toBe(1);
    expect(navigateSpy).toHaveBeenCalledWith('/settings');
  });

  it('should honor a safe in-app returnUrl', async () => {
    queryParams = { returnUrl: '/settings?tab=billing' };
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const component = fixture.componentInstance;

    component.email.set('ada@example.com');
    component.password.set('secret123');
    await component.submit(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith('/settings?tab=billing');
  });

  it('should reject unsafe returnUrl values and land on the dashboard', async () => {
    queryParams = { returnUrl: 'https://evil.example/phish' };
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const component = fixture.componentInstance;

    component.email.set('ada@example.com');
    component.password.set('secret123');
    await component.submit(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith('/settings');
  });

  it('should open the MFA panel when Firebase requires a second factor', async () => {
    const resolver = { hints: [], session: {} };
    authMock.login.mockResolvedValueOnce({
      success: false,
      error: 'MFA_REQUIRED',
      resolver,
    });
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const component = fixture.componentInstance;

    component.email.set('ada@example.com');
    component.password.set('secret123');
    await component.submit(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authMock.beginMfaChallenge).toHaveBeenCalledWith(resolver);
    expect(navigateSpy).toHaveBeenCalledWith(['/mfa'], { queryParams: undefined });
    expect(component.formError()).toBe('');
  });

  it('should forward returnUrl to MFA when a second factor is required', async () => {
    queryParams = { returnUrl: '/settings' };
    const resolver = { hints: [], session: {} };
    authMock.login.mockResolvedValueOnce({
      success: false,
      error: 'MFA_REQUIRED',
      resolver,
    });
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const component = fixture.componentInstance;

    component.email.set('ada@example.com');
    component.password.set('secret123');
    await component.submit(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/mfa'], { queryParams: { returnUrl: '/settings' } });
  });
});
