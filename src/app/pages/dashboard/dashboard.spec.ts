import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render banner and grid with stats and charts', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-banner')).toBeTruthy();
    expect(host.querySelector('h1.banner-heading')?.textContent).toContain('Dashboard');
    expect(host.querySelector('app-tile-board')).toBeTruthy();
    expect(host.querySelector('app-dashboard-grid')).toBeTruthy();
    expect(host.querySelectorAll('app-stat-card').length).toBeGreaterThanOrEqual(3);
    expect(host.querySelectorAll('app-chart-card').length).toBeGreaterThanOrEqual(3);
    expect(host.querySelector('app-area-chart')).toBeTruthy();
    expect(host.querySelector('app-bar-chart')).toBeTruthy();
    expect(host.querySelector('app-metric-list')).toBeTruthy();
  });
});
