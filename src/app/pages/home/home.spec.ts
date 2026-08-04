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

  it('should render the banner with homepage copy', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-banner')).toBeTruthy();
    expect(host.querySelector('h1.banner-heading')?.textContent).toContain(
      'Control plane for ML data',
    );
  });

  it('should show auth CTAs when logged out', () => {
    const labels = Array.from(fixture.nativeElement.querySelectorAll('app-button')).map((el) =>
      (el as HTMLElement).textContent?.trim(),
    );

    expect(labels).toContain('Sign up');
    expect(labels).toContain('Log in');
    expect(labels).toContain('Status directory');
  });

  it('should render landing sections without settings hash surfaces', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-page-section')).toBeTruthy();
    expect(host.querySelector('app-section-header')).toBeTruthy();
    expect(host.querySelector('app-form-panel')).toBeTruthy();
    expect(host.querySelector('app-card-grid')).toBeTruthy();
    expect(host.querySelector('app-card')).toBeTruthy();
    expect(host.querySelector('#account')).toBeNull();
    expect(host.querySelector('#sites')).toBeNull();
    expect(host.querySelector('#preferences')).toBeNull();
    expect(host.textContent).not.toContain('Manage sites');
    expect(host.textContent).toContain('What the control plane owns');
    expect(host.textContent).toContain('Jump into the product');
  });

  it('should show dashboard CTA when logged in', async () => {
    auth.isAuthenticated.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const labels = Array.from(fixture.nativeElement.querySelectorAll('app-button')).map((el) =>
      (el as HTMLElement).textContent?.trim(),
    );
    expect(labels).toContain('Open dashboard');
    expect(labels).toContain('Status directory');
    expect(labels).toContain('Learn');
    expect(labels).not.toContain('Sign up');
    expect(fixture.nativeElement.querySelector('#sites')).toBeNull();
  });
});
