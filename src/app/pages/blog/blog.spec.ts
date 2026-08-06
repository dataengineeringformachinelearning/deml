import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BLUE_NOTES } from '../../data/blue-notes';
import { Blog } from './blog';

describe('Blog', () => {
  let fixture: ComponentFixture<Blog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Blog],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Blog);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render Blue Notes branding and archive cards', () => {
    const host = fixture.nativeElement as HTMLElement;
    const cards = host.querySelectorAll('app-microcard');

    expect(host.querySelector('h1.banner-heading')?.textContent).toContain('Blue Notes');
    expect(cards.length).toBeGreaterThanOrEqual(1);
    expect(host.textContent).toContain(BLUE_NOTES[0].title);
    expect(host.querySelector('.microcard-cta')?.textContent?.trim()).toMatch(/Read/);
  });
});
