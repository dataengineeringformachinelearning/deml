import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Account } from './account';

describe('Account', () => {
  let fixture: ComponentFixture<Account>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Account],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Account);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render account tiles and preference cards', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-banner')).toBeTruthy();
    expect(host.querySelector('h1.banner-heading')?.textContent).toContain('Account');
    expect(host.querySelector('app-tile-board')).toBeTruthy();
    expect(host.querySelector('app-card-grid')).toBeTruthy();
  });

  it('should toggle theme from the banner action', () => {
    const before = fixture.componentInstance.isDark();
    fixture.componentInstance.toggleTheme();
    expect(fixture.componentInstance.isDark()).toBe(!before);
  });
});
