import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let auth: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    auth = TestBed.inject(AuthService);
    auth.logout();
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply iconColor to the navbar icon CSS variable', async () => {
    fixture.componentRef.setInput('iconColor', '#3c7a4a');
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.style.getPropertyValue('--navbar-icon-color').trim()).toBe('#3c7a4a');
  });

  it('should render guest nav links when logged out', () => {
    const host = fixture.nativeElement as HTMLElement;
    const links = Array.from(host.querySelectorAll('#site-navbar-menu a'));

    expect(links.map((el) => el.textContent?.trim())).toEqual([
      'Home',
      'Learn',
      'Blog',
      'Explore',
    ]);
    for (const link of links) {
      expect(link.hasAttribute('aria-label')).toBe(false);
    }
  });

  it('should render auth nav links when logged in', async () => {
    auth.isAuthenticated.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    const links = Array.from(host.querySelectorAll('#site-navbar-menu a'));

    expect(links.map((el) => el.textContent?.trim())).toEqual([
      'Dashboard',
      'Analytics',
      'Vulnerabilities',
      'Settings',
    ]);
  });

  it('should show Log in and Sign up when logged out', () => {
    const host = fixture.nativeElement as HTMLElement;
    const labels = Array.from(host.querySelectorAll('app-button')).map((el) =>
      (el as HTMLElement).textContent?.trim(),
    );

    expect(labels).toContain('Log in');
    expect(labels).toContain('Sign up');
  });

  it('should show Log out when logged in', async () => {
    auth.isAuthenticated.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    const labels = Array.from(host.querySelectorAll('app-button')).map((el) =>
      (el as HTMLElement).textContent?.trim(),
    );

    expect(labels).toContain('Log out');
    expect(labels).not.toContain('Log in');
    expect(labels).not.toContain('Sign up');
  });

  it('should toggle the mobile menu open and closed', async () => {
    const host = fixture.nativeElement as HTMLElement;
    const toggle = host.querySelector('.site-navbar-menu-toggle') as HTMLButtonElement;
    const navbar = host.querySelector('.site-navbar') as HTMLElement;

    expect(component.menuOpen()).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(navbar.classList.contains('is-menu-open')).toBe(false);

    toggle.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.menuOpen()).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Close menu');
    expect(navbar.classList.contains('is-menu-open')).toBe(true);

    toggle.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.menuOpen()).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});
