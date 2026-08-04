import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { MonitorService } from '../../services/monitor.service';
import { Settings } from './settings';

describe('Settings', () => {
  let fixture: ComponentFixture<Settings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: MonitorService,
          useValue: {
            peekStatusPages: () => undefined,
            getStatusPages: () =>
              of([
                {
                  id: 'p1',
                  title: 'Studio',
                  slug: 'studio',
                  description: 'Primary',
                  is_published: true,
                  created_at: '',
                  user_id: 1,
                },
              ]),
            createStatusPage: () => of({}),
            updateStatusPage: () => of({}),
            deleteStatusPage: () => of({}),
          },
        },
        {
          provide: AuthService,
          useValue: {
            currentUserRole: signal('Operator'),
            mfaEnrolled: signal(false),
            getAccountProfile: () => ({ displayName: 'Ada', email: 'ada@example.com' }),
            updateDisplayName: async () => ({ success: true }),
            isAuthenticated: signal(true),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render editable settings sections without card grids', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-banner')).toBeTruthy();
    expect(host.querySelector('h1.banner-heading')?.textContent).toContain('Settings');
    expect(host.querySelector('#account')).toBeTruthy();
    expect(host.querySelector('#sites')).toBeTruthy();
    expect(host.querySelector('#preferences')).toBeTruthy();
    expect(host.querySelector('app-form-panel')).toBeTruthy();
    expect(host.querySelector('app-card-grid')).toBeNull();
    expect(fixture.componentInstance.sites().length).toBe(1);
    expect(host.querySelector('table')).toBeTruthy();
  });

  it('should toggle theme from preferences', () => {
    const before = fixture.componentInstance.isDark();
    fixture.componentInstance.toggleTheme();
    expect(fixture.componentInstance.isDark()).toBe(!before);
  });
});
