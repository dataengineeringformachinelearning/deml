import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SiteFooter } from './site-footer';

describe('SiteFooter', () => {
  let fixture: ComponentFixture<SiteFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteFooter],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SiteFooter);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render restored footer directories and legal copy', () => {
    const host = fixture.nativeElement as HTMLElement;
    const text = host.textContent ?? '';

    expect(host.querySelector('footer.site-footer')).toBeTruthy();
    expect(host.querySelector('nav[aria-label="Footer"]')).toBeTruthy();
    expect(text).toContain('Platforms');
    expect(text).toContain('Resources');
    expect(text).toContain('Support');
    expect(text).toContain('Legal & Compliance');
    expect(text).toContain('Explore');
    expect(text).toContain('Platform Status');
    expect(text).toContain('Privacy Policy');
    expect(text).toContain('Made in the U.S.A.');
    expect(text).toContain('Joe Alongi');
  });
});
