import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { AuthService } from '../../services/auth';
import { Signup } from './signup';

describe('Signup', () => {
  let fixture: ComponentFixture<Signup>;
  let auth: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [provideRouter([{ path: 'dashboard', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(Signup);
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    auth.logout();
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create a centered signup form', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance).toBeTruthy();
    expect(host.querySelector('app-form-panel')).toBeTruthy();
    expect(host.querySelector('form.auth-form')).toBeTruthy();
    expect(host.querySelector('h1')?.textContent).toContain('Create account');
  });

  it('should require terms acceptance', async () => {
    const component = fixture.componentInstance;
    component.name.set('Ada');
    component.email.set('ada@example.com');
    component.password.set('secret123');
    component.confirmPassword.set('secret123');
    component.acceptTerms.set(false);
    component.submit(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.formError()).toContain('terms');
    expect(auth.loggedIn()).toBe(false);
  });

  it('should sign up and navigate when the form is valid', async () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const component = fixture.componentInstance;

    component.name.set('Ada Lovelace');
    component.email.set('ada@example.com');
    component.password.set('secret123');
    component.confirmPassword.set('secret123');
    component.acceptTerms.set(true);
    component.submit(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(auth.loggedIn()).toBe(true);
    expect(auth.currentUser()?.name).toBe('Ada Lovelace');
    expect(navigateSpy).toHaveBeenCalledWith('/dashboard');
  });
});
