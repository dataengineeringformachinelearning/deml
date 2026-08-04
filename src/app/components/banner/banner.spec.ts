import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Banner } from './banner';

@Component({
  selector: 'app-host',
  imports: [Banner],
  template: `
    <app-banner
      preheader="DEML"
      heading="Build with clarity."
      lede="Supporting copy."
    >
      <button type="button" id="projected">Action</button>
    </app-banner>
  `,
})
class Host {}

@Component({
  selector: 'app-level-host',
  imports: [Banner],
  template: `<app-banner heading="Section" [headingLevel]="2" headingId="section-heading" />`,
})
class LevelHost {}

@Component({
  selector: 'app-hero-host',
  imports: [Banner],
  template: `<app-banner variant="hero" heading="Hero" />`,
})
class HeroHost {}

describe('Banner', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host, LevelHost, HeroHost],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render dynamic banner content', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('.preheader')?.textContent?.trim()).toBe('DEML');
    const heading = host.querySelector('h1.banner-heading');
    expect(heading?.textContent?.trim()).toBe('Build with clarity.');
    expect(heading?.id).toMatch(/^banner-heading-/);
    expect(host.querySelector('.lede')?.textContent?.trim()).toBe('Supporting copy.');
    expect(host.querySelector('#projected')?.textContent?.trim()).toBe('Action');
  });

  it('should honor headingLevel for document outline', async () => {
    const fixture = TestBed.createComponent(LevelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('h2#section-heading')?.textContent?.trim()).toBe('Section');
    expect(host.querySelector('h1')).toBeNull();
  });

  it('should apply hero variant class and data attribute', async () => {
    const fixture = TestBed.createComponent(HeroHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('app-banner')?.getAttribute('data-variant')).toBe('hero');
    expect(host.querySelector('.banner.banner--hero')).toBeTruthy();
  });
});
