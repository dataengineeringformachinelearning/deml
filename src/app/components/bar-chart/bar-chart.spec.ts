import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChart } from './bar-chart';

@Component({
  selector: 'app-host',
  imports: [BarChart],
  template: `
    <app-bar-chart
      [items]="items"
      accent="red"
      ariaLabel="Traffic by channel"
    />
  `,
})
class Host {
  readonly items = [
    { label: 'Direct', value: 100, display: '100' },
    { label: 'Search', value: 50, display: '50' },
  ];
}

describe('BarChart', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render labeled rows', () => {
    const host = fixture.nativeElement as HTMLElement;
    const labels = Array.from(host.querySelectorAll('.bar-chart-label')).map((el) =>
      el.textContent?.trim(),
    );
    expect(labels).toEqual(['Direct', 'Search']);
    expect(host.querySelector('app-bar-chart')?.getAttribute('data-accent')).toBe('red');
  });
});
