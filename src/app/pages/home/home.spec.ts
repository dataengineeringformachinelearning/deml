import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { Home } from './home';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let auth: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    auth = TestBed.inject(AuthService);
    auth.logout();
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a hero-only landing', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-banner')?.getAttribute('data-variant')).toBe('hero');
    expect(host.querySelector('h1.banner-heading')?.textContent).toContain(
      'Status your customers can trust',
    );
    expect(host.querySelector('app-card-grid')).toBeNull();
    expect(host.querySelector('app-page-section')).toBeNull();
  });

  it('should show explore and login when logged out', () => {
    const labels = Array.from(fixture.nativeElement.querySelectorAll('app-button')).map((el) =>
      (el as HTMLElement).textContent?.trim(),
    );
    expect(labels).toContain('Explore');
    expect(labels).toContain('Log in');
    expect(labels).not.toContain('Sign up');
  });

  it('should show settings when logged in', async () => {
    auth.isAuthenticated.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const labels = Array.from(fixture.nativeElement.querySelectorAll('app-button')).map((el) =>
      (el as HTMLElement).textContent?.trim(),
    );
    expect(labels).toEqual(['Settings']);
  });
});
