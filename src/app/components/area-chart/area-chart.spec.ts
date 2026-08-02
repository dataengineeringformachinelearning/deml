import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CHART_SCALE } from '../dashboard/chart-scale';
import { AreaChart } from './area-chart';

@Component({
  selector: 'app-host',
  imports: [AreaChart],
  template: `
    <app-area-chart
      [points]="points"
      accent="gold"
      ariaLabel="Weekly sessions"
    />
  `,
})
class Host {
  readonly points = [
    { label: 'Mon', value: 10 },
    { label: 'Tue', value: 20 },
    { label: 'Wed', value: 15 },
  ];
}

@Component({
  selector: 'app-spark-host',
  imports: [AreaChart],
  template: `
    <app-area-chart
      [points]="points"
      variant="spark"
      ariaLabel="Trend"
    />
  `,
})
class SparkHost {
  readonly points = [
    { label: '1', value: 4 },
    { label: '2', value: 8 },
  ];
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
    expect(svg?.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
    expect(svg?.getAttribute('viewBox')).toBe(
      `0 0 ${CHART_SCALE.viewInline} ${CHART_SCALE.viewBlock}`,
    );
    expect(chart?.querySelector('path.area-chart-line')).toBeTruthy();
    expect(chart?.querySelector('path.area-chart-fill')).toBeTruthy();
    expect(chart?.querySelectorAll('circle.area-chart-node').length).toBe(3);
    expect(chart?.querySelectorAll('line.area-chart-grid-v').length).toBe(3);
    expect(chart?.querySelector('line.area-chart-baseline')).toBeTruthy();
  });

  it('should keep spark plots on meet so the series is never stretched', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SparkHost],
    }).compileComponents();

    const sparkFixture = TestBed.createComponent(SparkHost);
    sparkFixture.detectChanges();
    await sparkFixture.whenStable();

    const svg = (sparkFixture.nativeElement as HTMLElement).querySelector('svg.area-chart');
    expect(svg?.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
  });
});
