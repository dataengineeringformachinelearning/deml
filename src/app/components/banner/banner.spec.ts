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

describe('Banner', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host, LevelHost],
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
    expect(host.querySelector('h1#banner-heading')?.textContent?.trim()).toBe(
      'Build with clarity.',
    );
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
});
