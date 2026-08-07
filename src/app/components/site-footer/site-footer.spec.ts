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

  it('should render categorized suite, legal links, and Joe Alongi credit', () => {
    const host = fixture.nativeElement as HTMLElement;
    const text = host.textContent ?? '';
    const headings = Array.from(host.querySelectorAll('.site-footer__heading')).map((el) =>
      el.textContent?.trim(),
    );
    const labels = Array.from(host.querySelectorAll('.site-footer__list a')).map((el) =>
      el.textContent?.trim(),
    );

    expect(host.querySelector('footer.site-footer')).toBeTruthy();
    expect(host.querySelector('nav[aria-label="Footer"]')).toBeTruthy();
    expect(host.querySelectorAll('.site-footer__group').length).toBe(2);
    expect(headings).toEqual(['Resources', 'Legal']);
    expect(labels).toEqual([
      'Book',
      'Whitepaper',
      'Docs',
      'Blog',
      'Compliance',
      'Privacy',
      'Terms',
      'Status',
    ]);
    expect(
      host
        .querySelector('a[href="https://dataengineeringformachinelearning.com/blog"]')
        ?.textContent?.trim(),
    ).toBe('Blog');
    expect(text).toContain('Made in the U.S.A.');
    expect(text).toContain('Joe Alongi');
    expect(text).toContain(`Copyright © ${new Date().getFullYear()}`);
    expect(
      host.querySelector('a[href="https://joealongi.dev/"]')?.getAttribute('rel'),
    ).toContain('noopener');
  });
});

