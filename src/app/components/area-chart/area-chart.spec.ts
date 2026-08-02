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

  it('should render an accessible Spotify-style svg chart', () => {
    const chart = (fixture.nativeElement as HTMLElement).querySelector('app-area-chart');
    expect(chart?.getAttribute('role')).toBe('img');
    expect(chart?.getAttribute('aria-label')).toBe('Weekly sessions');
    expect(chart?.getAttribute('data-accent')).toBe('gold');
    expect(chart?.querySelector('path.area-chart-line')).toBeTruthy();
    expect(chart?.querySelector('path.area-chart-fill')).toBeTruthy();
    expect(chart?.querySelectorAll('circle.area-chart-node').length).toBe(3);
    expect(chart?.querySelectorAll('line.area-chart-grid-v').length).toBe(3);
    expect(chart?.querySelector('line.area-chart-baseline')).toBeTruthy();
  });
});
