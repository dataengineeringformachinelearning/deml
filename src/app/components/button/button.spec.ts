import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Button } from './button';

@Component({
  selector: 'app-host',
  imports: [Button],
  template: `
    <app-button variant="accent" shape="pill">Sign up</app-button>
    <app-button variant="secondary" shape="pill" href="/blog/">Read</app-button>
    <app-button variant="accent" shape="pill" routerLink="/blog">Router</app-button>
  `,
})
class Host {}

describe('Button', () => {
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

  it('should render projected label on a button', () => {
    const button = fixture.nativeElement.querySelector('button.button') as HTMLButtonElement;
    expect(button.textContent?.trim()).toBe('Sign up');
    expect(button.classList.contains('button--accent')).toBe(true);
    expect(button.classList.contains('button--pill')).toBe(true);
  });

  it('should render as a link when href is provided', () => {
    const link = fixture.nativeElement.querySelector('a.button[href="/blog/"]') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.textContent?.trim()).toBe('Read');
    expect(link.classList.contains('button--secondary')).toBe(true);
  });

  it('should render as a router link when routerLink is provided', () => {
    const links = Array.from(
      fixture.nativeElement.querySelectorAll('a.button') as NodeListOf<HTMLAnchorElement>,
    );
    const routerLink = links.find((el) => el.textContent?.trim() === 'Router');
    expect(routerLink).toBeTruthy();
  });
});
