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

  it('should render compact legal footer', () => {
    const host = fixture.nativeElement as HTMLElement;
    const text = host.textContent ?? '';

    expect(host.querySelector('footer.site-footer')).toBeTruthy();
    expect(host.querySelector('nav[aria-label="Footer"]')).toBeTruthy();
    expect(text).toContain('Privacy');
    expect(text).toContain('Terms');
    expect(text).toContain('Status');
    expect(text).toContain(`© ${new Date().getFullYear()} DEML`);
  });
});
