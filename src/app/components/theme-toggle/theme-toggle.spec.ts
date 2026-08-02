import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeService } from '../../services/theme';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  let fixture: ComponentFixture<ThemeToggle>;
  let theme: ThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeToggle],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggle);
    theme = TestBed.inject(ThemeService);
    theme.setTheme('dark');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should toggle theme when clicked', async () => {
    const toggle = fixture.nativeElement.querySelector('.theme-toggle') as HTMLButtonElement;

    expect(theme.theme()).toBe('dark');
    toggle.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(theme.theme()).toBe('light');
  });
});
