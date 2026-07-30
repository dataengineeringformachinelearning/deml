import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, type WritableSignal } from '@angular/core';
import { Status } from './status';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth.service';
import { API_ENDPOINTS } from '../../core/constants/api.constants';

describe('Status', () => {
  let component: Status;
  let fixture: ComponentFixture<Status>;
  let httpMock: HttpTestingController;
  let auth: {
    isAuthenticated: WritableSignal<boolean>;
    isInitialized: WritableSignal<boolean>;
    currentUserId: WritableSignal<number | null>;
  };

  beforeEach(async () => {
    auth = {
      isAuthenticated: signal(false),
      isInitialized: signal(false),
      currentUserId: signal<number | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [Status],
      providers: [
        provideRouter([{ path: 'status/:slug', redirectTo: '' }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Status);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads real status telemetry in an automated browser', () => {
    const originalWebdriver = Object.getOwnPropertyDescriptor(navigator, 'webdriver');
    Object.defineProperty(navigator, 'webdriver', {
      configurable: true,
      value: true,
    });
    try {
      auth.isAuthenticated.set(true);
      auth.currentUserId.set(7);

      component.loadData();
      httpMock.expectOne(API_ENDPOINTS.SYSTEM_STATUS.STATUS_PAGES).flush([
        {
          id: 'platform',
          title: 'Platform Status',
          slug: 'platform-status',
          description: '',
          created_at: '2026-07-27T00:00:00Z',
          user_id: null,
          cumulative_sla: 100,
          p99_latency: 5,
          total_requests: 4959,
        },
      ]);

      expect(component.statusPages()[0]).toMatchObject({
        slug: 'platform-status',
        cumulative_sla: 100,
        p99_latency: 5,
        total_requests: 4959,
      });
    } finally {
      if (originalWebdriver) {
        Object.defineProperty(navigator, 'webdriver', originalWebdriver);
      } else {
        delete (navigator as Navigator & { webdriver?: boolean }).webdriver;
      }
    }
  });

  it('prefers service telemetry, falls back to page telemetry, and preserves missing metrics', () => {
    component.servicesMap.set({
      platform: [
        {
          id: 'service-measured',
          name: 'Measured service',
          url: 'https://measured.example',
          status_page_id: 'platform',
          created_at: '2026-07-27T00:00:00Z',
          sla: 99.91,
          p99_latency: 17,
        },
        {
          id: 'service-page-fallback',
          name: 'Page fallback service',
          url: 'https://fallback.example',
          status_page_id: 'platform',
          created_at: '2026-07-27T00:00:00Z',
          sla: null,
          p99_latency: null,
        },
        {
          id: 'service-no-data',
          name: 'No data service',
          url: 'https://no-data.example',
          status_page_id: 'platform',
          created_at: '2026-07-27T00:00:00Z',
        },
      ],
    });

    const measured = component.dashboardServices({
      id: 'platform',
      title: 'Platform Status',
      slug: 'platform-status',
      description: '',
      created_at: '2026-07-27T00:00:00Z',
      user_id: null,
      overall_uptime: 98.75,
      p99_latency: 42,
    });
    expect(measured.map(({ uptime, latency }) => ({ uptime, latency }))).toEqual([
      { uptime: '99.91%', latency: '17ms' },
      { uptime: '98.75%', latency: '42ms' },
      { uptime: '98.75%', latency: '42ms' },
    ]);

    const noData = component.dashboardServices({
      id: 'platform',
      title: 'Platform Status',
      slug: 'platform-status',
      description: '',
      created_at: '2026-07-27T00:00:00Z',
      user_id: null,
      p99_latency: null,
    });
    expect(noData.map(({ uptime, latency }) => ({ uptime, latency }))).toEqual([
      { uptime: '99.91%', latency: '17ms' },
      { uptime: '—', latency: '—' },
      { uptime: '—', latency: '—' },
    ]);
  });
});
