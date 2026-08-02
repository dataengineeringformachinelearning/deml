import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Button } from '../button/button';
import { ButtonGroup } from '../button-group/button-group';
import { Card } from './card';

@Component({
  selector: 'app-host',
  imports: [Card, Button, ButtonGroup],
  template: `
    <app-card heading="Sites" subtext="Launch and manage your presence." visual="gold">
      <app-button-group align="center" layout="row">
        <app-button variant="primary" shape="pill">Learn more</app-button>
        <app-button variant="secondary" shape="pill">Buy</app-button>
      </app-button-group>
    </app-card>
  `,
})
class Host {}

@Component({
  selector: 'app-teaser-host',
  imports: [Card, Button, ButtonGroup],
  template: `
    <app-card
      layout="teaser"
      heading="Build with clarity"
      subtext="A quieter interface."
      meta="Jul 2026 · Process"
      visual="gold"
    >
      <app-button-group align="start" layout="row">
        <app-button variant="primary" shape="pill">Read</app-button>
      </app-button-group>
    </app-card>
  `,
})
class TeaserHost {}

describe('Card', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host, TeaserHost],
    }).compileComponents();
  });

  it('should render h3, subtext, and projected actions', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('h3')?.textContent?.trim()).toBe('Sites');
    expect(host.querySelector('.card-subtext')?.textContent?.trim()).toContain('Launch and manage');
    expect(host.querySelectorAll('app-button').length).toBe(2);
    expect(host.querySelector('.card')?.getAttribute('aria-labelledby')).toBeTruthy();
  });

  it('should render teaser layout with meta', async () => {
    const fixture = TestBed.createComponent(TeaserHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const cardHost = host.querySelector('app-card');

    expect(cardHost?.getAttribute('data-layout')).toBe('teaser');
    expect(host.querySelector('.card-meta')?.textContent?.trim()).toBe('Jul 2026 · Process');
    expect(host.querySelector('h3')?.textContent?.trim()).toBe('Build with clarity');
  });
});
