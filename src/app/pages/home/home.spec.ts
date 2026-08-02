import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../services/auth';
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
    expect(host.querySelector('#banner-heading')?.textContent).toContain('Build with clarity');
  });

  it('should show auth CTAs when logged out', () => {
    const labels = Array.from(fixture.nativeElement.querySelectorAll('app-button')).map((el) =>
      (el as HTMLElement).textContent?.trim(),
    );

    expect(labels).toContain('Sign up');
    expect(labels).toContain('Log in');
  });
});
