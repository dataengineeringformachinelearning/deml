// CHART RULES LOCKED: height fixed, width 100%, shared global scale – DO NOT CHANGE
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CHART_SCALE, computeSharedDomain } from '../dashboard/chart-scale';
import { AreaChart } from './area-chart';

@Component({
  selector: 'app-host',
  imports: [AreaChart],
  template: `
    <app-area-chart
      [points]="points"
      [domain]="domain"
      accent="gold"
      ariaLabel="Weekly sessions"
    />
  `,
})
class Host {
  readonly points = [
    { label: 'W1', value: 1200 },
    { label: 'W2', value: 1560 },
    { label: 'W8', value: 2510 },
  ];
  readonly domain = computeSharedDomain([this.points]);
}

@Component({
  selector: 'app-spark-host',
  imports: [AreaChart],
  template: `
    <app-area-chart
      [points]="points"
      [domain]="domain"
      variant="spark"
      ariaLabel="Trend"
    />
  `,
})
class SparkHost {
  readonly points = [
    { label: '1', value: 1280 },
    { label: '2', value: 2180 },
  ];
  readonly domain = computeSharedDomain([
    this.points,
    [
      { label: 'W1', value: 1200 },
      { label: 'W8', value: 2510 },
    ],
  ]);
}

describe('AreaChart', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render an accessible svg chart with a data table', () => {
    const chart = (fixture.nativeElement as HTMLElement).querySelector('app-area-chart');
    const svg = chart?.querySelector('svg.area-chart');
    expect(chart?.getAttribute('data-accent')).toBe('gold');
    expect(chart?.querySelector('table.visually-hidden caption')?.textContent?.trim()).toBe(
      'Weekly sessions',
    );
    expect(chart?.querySelectorAll('table.visually-hidden tbody tr').length).toBe(3);
    expect(svg?.getAttribute('preserveAspectRatio')).toBe('none');
    expect(svg?.getAttribute('viewBox')).toBe(
      `0 0 ${CHART_SCALE.viewInline} ${CHART_SCALE.viewBlock}`,
    );
    expect(chart?.querySelector('path.area-chart-line')).toBeTruthy();
    expect(chart?.querySelector('path.area-chart-fill')).toBeTruthy();
    expect(chart?.querySelectorAll('circle.area-chart-node').length).toBe(3);
    expect(chart?.querySelectorAll('line.area-chart-grid-v').length).toBe(3);
    expect(chart?.querySelector('line.area-chart-baseline')).toBeTruthy();
    expect(chart?.querySelector('.area-chart-y')?.textContent).toContain('2,510');
  });

  it('should omit axes and grid on spark plots while using the shared domain', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SparkHost],
    }).compileComponents();

    const sparkFixture = TestBed.createComponent(SparkHost);
    sparkFixture.detectChanges();
    await sparkFixture.whenStable();

    const chart = (sparkFixture.nativeElement as HTMLElement).querySelector('app-area-chart');
    const svg = chart?.querySelector('svg.area-chart');
    expect(svg?.getAttribute('preserveAspectRatio')).toBe('none');
    expect(svg?.getAttribute('viewBox')).toBe(
      `0 0 ${CHART_SCALE.sparkViewInline} ${CHART_SCALE.sparkViewBlock}`,
    );
    expect(chart?.getAttribute('data-variant')).toBe('spark');
    expect(chart?.querySelectorAll('line.area-chart-grid-v').length).toBe(0);
    expect(chart?.querySelector('.area-chart-y')).toBeNull();
    expect(chart?.querySelectorAll('circle.area-chart-node').length).toBe(2);
  });
});
