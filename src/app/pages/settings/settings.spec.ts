import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Settings } from './settings';

describe('Settings', () => {
  let fixture: ComponentFixture<Settings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render settings catalog cards', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-banner')).toBeTruthy();
    expect(host.querySelector('h1.banner-heading')?.textContent).toContain('Settings');
    expect(host.querySelector('app-card-grid')).toBeTruthy();
    expect(host.querySelectorAll('app-card').length).toBeGreaterThan(0);
  });
});
