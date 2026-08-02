import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatCard } from './stat-card';

@Component({
  selector: 'app-host',
  imports: [StatCard],
  template: `
    <app-stat-card
      label="Active listeners"
      value="12.4k"
      delta="+18%"
      meta="vs prior period"
      size="md"
      accent="primary"
      [sparkline]="spark"
    />
  `,
})
class Host {
  readonly spark = [
    { label: '1', value: 10 },
    { label: '2', value: 16 },
    { label: '3', value: 14 },
    { label: '4', value: 22 },
  ];
}

describe('StatCard', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render label, value, and delta', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.stat-card-label')?.textContent?.trim()).toBe('Active listeners');
    expect(host.querySelector('.stat-card-value')?.textContent?.trim()).toBe('12.4k');
    expect(host.querySelector('.stat-card-delta')?.textContent).toContain('+18%');
  });

  it('should expose size and accent on the host', () => {
    const card = (fixture.nativeElement as HTMLElement).querySelector('app-stat-card');
    expect(card?.getAttribute('data-size')).toBe('md');
    expect(card?.getAttribute('data-accent')).toBe('primary');
    expect(card?.getAttribute('data-trend')).toBe('up');
  });

  it('should render a sparkline for multi-point series', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-area-chart')).toBeTruthy();
  });
});
