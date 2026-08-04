import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '../../services/auth.service';
import { Mfa } from './mfa';

describe('Mfa', () => {
  let fixture: ComponentFixture<Mfa>;
  let router: Router;
  let queryParams: Record<string, string>;
  const mfaPhoneHint = signal('');
  const authMock = {
    mfaPhoneHint,
    hasPendingMfaChallenge: vi.fn(() => true),
    sendMfaSignInCode: vi.fn(async () => ({ success: true })),
    resolveMfaSignIn: vi.fn(async () => ({ success: true })),
    clearMfaChallenge: vi.fn(),
  };

  beforeEach(async () => {
    mfaPhoneHint.set('+1••••5671');
    queryParams = {};
    authMock.hasPendingMfaChallenge.mockReturnValue(true);
    authMock.sendMfaSignInCode.mockClear().mockResolvedValue({ success: true });
    authMock.resolveMfaSignIn.mockClear().mockResolvedValue({ success: true });
    authMock.clearMfaChallenge.mockClear();

    await TestBed.configureTestingModule({
      imports: [Mfa],
      providers: [
        provideRouter([
          { path: 'login', children: [] },
          { path: 'dashboard', children: [] },
          { path: 'settings', children: [] },
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

    fixture = TestBed.createComponent(Mfa);
    router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create a centered MFA form panel', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance).toBeTruthy();
    expect(host.querySelector('app-form-panel')).toBeTruthy();
    expect(host.querySelector('form.form-panel__form')).toBeTruthy();
    expect(host.querySelector('h1')?.textContent).toContain("Verify it's you");
  });

  it('should send an SMS code on init when a challenge is pending', () => {
    expect(authMock.sendMfaSignInCode).toHaveBeenCalled();
    expect(fixture.componentInstance.codeSent()).toBe(true);
  });

  it('should redirect to login when no MFA challenge is pending', async () => {
    authMock.hasPendingMfaChallenge.mockReturnValue(false);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const orphan = TestBed.createComponent(Mfa);
    orphan.detectChanges();
    await orphan.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(
      ['/login'],
      expect.objectContaining({ replaceUrl: true }),
    );
  });

  it('should show validation when submitted empty', async () => {
    const component = fixture.componentInstance;
    component.codeSent.set(true);
    await component.submit(new Event('submit'));
    fixture.detectChanges();

    expect(component.codeError()).toContain('verification code');
    expect(authMock.resolveMfaSignIn).not.toHaveBeenCalled();
  });

  it('should verify the code and navigate to the dashboard by default', async () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const component = fixture.componentInstance;

    component.codeSent.set(true);
    component.code.set('123456');
    await component.submit(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authMock.resolveMfaSignIn).toHaveBeenCalledWith('123456');
    expect(navigateSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('should honor a safe in-app returnUrl after MFA', async () => {
    queryParams = { returnUrl: '/settings?tab=security' };
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const component = fixture.componentInstance;

    component.codeSent.set(true);
    component.code.set('123456');
    await component.submit(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith('/settings?tab=security');
  });

  it('should reject unsafe returnUrl values after MFA', async () => {
    queryParams = { returnUrl: 'https://evil.example/phish' };
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const component = fixture.componentInstance;

    component.codeSent.set(true);
    component.code.set('123456');
    await component.submit(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('should clear the challenge when canceling back to login', () => {
    fixture.componentInstance.cancel();
    expect(authMock.clearMfaChallenge).toHaveBeenCalled();
  });
});
