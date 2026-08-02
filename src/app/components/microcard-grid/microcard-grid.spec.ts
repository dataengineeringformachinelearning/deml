import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Microcard } from '../microcard/microcard';
import { MicrocardGrid } from './microcard-grid';

@Component({
  selector: 'app-host',
  imports: [MicrocardGrid, Microcard],
  template: `
    <app-microcard-grid ariaLabel="Posts" [columns]="3">
      <li>
        <app-microcard
          heading="One"
          routerLink="/blog/one"
        />
      </li>
      <li>
        <app-microcard
          heading="Two"
          routerLink="/blog/two"
        />
      </li>
    </app-microcard-grid>
  `,
})
class Host {}

describe('MicrocardGrid', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should project microcards into an accessible list grid', () => {
    const host = fixture.nativeElement as HTMLElement;
    const grid = host.querySelector('app-microcard-grid');
    const list = grid?.querySelector('ul.microcard-grid');
    expect(grid?.getAttribute('data-columns')).toBe('3');
    expect(list?.getAttribute('role')).toBe('list');
    expect(list?.getAttribute('aria-label')).toBe('Posts');
    expect(host.querySelectorAll('app-microcard').length).toBe(2);
  });
});
