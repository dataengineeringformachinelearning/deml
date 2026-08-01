import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply iconColor to the navbar icon CSS variable', async () => {
    fixture.componentRef.setInput('iconColor', '#5c2a4a');
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.style.getPropertyValue('--navbar-icon-color').trim()).toBe('#5c2a4a');
  });

  it('should toggle the mobile menu open and closed', async () => {
    const host = fixture.nativeElement as HTMLElement;
    const toggle = host.querySelector('.site-navbar-menu-toggle') as HTMLButtonElement;
    const navbar = host.querySelector('.site-navbar') as HTMLElement;

    expect(component.menuOpen()).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(navbar.classList.contains('is-menu-open')).toBe(false);

    toggle.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.menuOpen()).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Close menu');
    expect(navbar.classList.contains('is-menu-open')).toBe(true);

    toggle.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.menuOpen()).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(navbar.classList.contains('is-menu-open')).toBe(false);
  });
});
