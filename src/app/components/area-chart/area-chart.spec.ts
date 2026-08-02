import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

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
    expect(svg?.getAttribute('viewBox')).toBe('0 0 360 200');
    expect(chart?.querySelector('path.area-chart-line')).toBeTruthy();
    expect(chart?.querySelector('path.area-chart-fill')).toBeTruthy();
    expect(chart?.querySelectorAll('circle.area-chart-node').length).toBe(3);
    expect(chart?.querySelectorAll('line.area-chart-grid-v').length).toBe(3);
    expect(chart?.querySelector('line.area-chart-baseline')).toBeTruthy();
  });
});


