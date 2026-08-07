import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BLUE_NOTES } from '../../data/blue-notes';
import { BlogPostPage } from './blog-post';

describe('BlogPostPage', () => {
  let fixture: ComponentFixture<BlogPostPage>;
  const sample = BLUE_NOTES[0];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogPostPage);
    fixture.componentRef.setInput('slug', sample.slug);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render blog reading layout', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('h1.banner-heading')?.textContent?.trim()).toBe(sample.title);
    expect(host.querySelector('.article-body')?.innerHTML).toContain('<h2');
    expect(host.textContent).toContain('All posts');
    if (sample.headings.length > 1) {
      expect(host.querySelector('.toc')?.getAttribute('aria-label')).toBe('On this page');
    }
  });
});
