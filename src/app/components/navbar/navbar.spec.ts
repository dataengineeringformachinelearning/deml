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

  it('should render the Lucide ship brand mark with home aria-label', () => {
    const host = fixture.nativeElement as HTMLElement;
    const brand = host.querySelector('.site-navbar-icon') as HTMLAnchorElement | null;
    const ship = host.querySelector('.site-navbar-icon svg[lucideShip]');

    expect(brand).toBeTruthy();
    expect(brand?.getAttribute('aria-label')).toBe('DEML home');
    expect(ship).toBeTruthy();
    expect(ship?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should render guest nav links when logged out', () => {
    const host = fixture.nativeElement as HTMLElement;
    const links = Array.from(host.querySelectorAll('#site-navbar-menu a'));

    expect(links.map((el) => el.textContent?.trim())).toEqual([
      'Explore',
      'Book',
      'Whitepaper',
      'Docs',
      'Blog',
      'Compliance',
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
      'Explore',
      'Settings',
      'Book',
      'Whitepaper',
      'Docs',
      'Blog',
      'Compliance',
    ]);
  });

  it('should keep Log in / Log out chrome and link community Blog externally', async () => {
    const host = fixture.nativeElement as HTMLElement;
    const blog = Array.from(host.querySelectorAll('#site-navbar-menu a')).find(
      (el) => el.textContent?.trim() === 'Blog',
    ) as HTMLAnchorElement | undefined;

    expect(blog?.getAttribute('href')).toBe(
      'https://dataengineeringformachinelearning.com/blog',
    );
    expect(host.textContent).toContain('Log in');

    auth.isAuthenticated.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const labels = Array.from(host.querySelectorAll('app-button')).map((el) =>
      (el as HTMLElement).textContent?.trim(),
    );
    expect(labels).toContain('Log out');
    expect(labels).not.toContain('Log in');
  });

  it('should show Log in when logged out', () => {
    const host = fixture.nativeElement as HTMLElement;
    const labels = Array.from(host.querySelectorAll('app-button')).map((el) =>
      (el as HTMLElement).textContent?.trim(),
    );

    expect(labels).toContain('Log in');
    expect(labels).not.toContain('Sign up');
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
