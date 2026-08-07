import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '../../services/auth.service';
import { Signup } from './signup';

describe('Signup', () => {
  let fixture: ComponentFixture<Signup>;
  let router: Router;
  const isAuthenticated = signal(false);
  const currentUserId = signal<number | null>(null);
  const authMock = {
    isAuthenticated,
    currentUserId,
    logout: vi.fn(async () => {
      isAuthenticated.set(false);
      currentUserId.set(null);
    }),
    register: vi.fn(async () => {
      isAuthenticated.set(true);
      currentUserId.set(1);
      return { success: true };
    }),
  };

  beforeEach(async () => {
    isAuthenticated.set(false);
    currentUserId.set(null);
    authMock.register.mockClear();
    authMock.logout.mockClear();

    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [
        provideRouter([{ path: 'dashboard', children: [] }]),
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Signup);
    router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create a centered signup form', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance).toBeTruthy();
    expect(host.querySelector('app-form-panel')).toBeTruthy();
    expect(host.querySelector('form.form-panel__form')).toBeTruthy();
    expect(host.querySelector('h1')?.textContent).toContain('Create account');
  });

  it('should require terms acceptance', async () => {
    const component = fixture.componentInstance;
    component.name.set('Ada');
    component.email.set('ada@example.com');
    component.password.set('secret123');
    component.confirmPassword.set('secret123');
    component.acceptTerms.set(false);
    await component.submit(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.formError()).toContain('terms');
    expect(authMock.isAuthenticated()).toBe(false);
    expect(authMock.register).not.toHaveBeenCalled();
  });

  it('should sign up and navigate when the form is valid', async () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const component = fixture.componentInstance;

    component.name.set('Ada Lovelace');
    component.email.set('ada@example.com');
    component.password.set('secret123');
    component.confirmPassword.set('secret123');
    component.acceptTerms.set(true);
    await component.submit(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authMock.register).toHaveBeenCalledWith({
      username: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret123',
    });
    expect(authMock.isAuthenticated()).toBe(true);
    expect(authMock.currentUserId()).toBe(1);
    expect(navigateSpy).toHaveBeenCalledWith('/settings');
  });
});
