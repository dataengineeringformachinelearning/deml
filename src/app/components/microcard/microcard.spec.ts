import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Microcard } from './microcard';

@Component({
  selector: 'app-host',
  imports: [Microcard],
  template: `
    <app-microcard
      heading="fastapi"
      subtext="API framework"
      meta="Backend (Python)"
      visual="olive"
      [routerLink]="['/blog', 'fastapi']"
      cta="Read"
    />
  `,
})
class Host {}

describe('Microcard', () => {
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

  it('should render linked heading, meta, and CTA', () => {
    const host = fixture.nativeElement as HTMLElement;
    const link = host.querySelector('a.microcard');

    expect(link?.getAttribute('href')).toBe('/blog/fastapi');
    expect(host.querySelector('h3')?.textContent?.trim()).toBe('fastapi');
    expect(host.querySelector('.microcard-meta')?.textContent?.trim()).toBe('Backend (Python)');
    expect(host.querySelector('.microcard-cta')?.textContent?.trim()).toBe('Read');
  });
});
