import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Card } from '../card/card';
import { CardGrid } from './card-grid';

@Component({
  selector: 'app-host',
  imports: [CardGrid, Card],
  template: `
    <app-card-grid>
      <app-card heading="One" />
      <app-card heading="Two" />
    </app-card-grid>
  `,
})
class Host {}

describe('CardGrid', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should project cards into the grid', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-card-grid')).toBeTruthy();
    expect(host.querySelectorAll('app-card').length).toBe(2);
  });
});
