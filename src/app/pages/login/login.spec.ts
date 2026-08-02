import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '../../services/auth.service';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let auth: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([{ path: 'dashboard', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    auth.logout();
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create a centered login form', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance).toBeTruthy();
    expect(host.querySelector('app-form-panel')).toBeTruthy();
    expect(host.querySelector('form.auth-form')).toBeTruthy();
    expect(host.querySelector('h1')?.textContent).toContain('Log in');
  });

  it('should show validation errors when submitted empty', async () => {
    const host = fixture.nativeElement as HTMLElement;
    host.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.emailError()).toContain('email');
    expect(fixture.componentInstance.passwordError()).toContain('password');
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('should log in and navigate when the form is valid', async () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const component = fixture.componentInstance;

    component.email.set('ada@example.com');
    component.password.set('secret123');
    component.submit(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.currentUser()?.name).toBe('ada');
    expect(navigateSpy).toHaveBeenCalledWith('/dashboard');
  });
});
