import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Analytics } from './analytics';

describe('Analytics', () => {
  let fixture: ComponentFixture<Analytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Analytics],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Analytics);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render analytics banner and tile board', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-banner')).toBeTruthy();
    expect(host.querySelector('h1.banner-heading')?.textContent).toContain('Analytics');
    expect(host.querySelector('app-tile-board')).toBeTruthy();
  });
});
