import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BlogPostPage } from './blog-post';

describe('BlogPostPage', () => {
  let fixture: ComponentFixture<BlogPostPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogPostPage);
    fixture.componentRef.setInput('slug', 'build-with-clarity');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render shared article template for a post', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('h1.banner-heading')?.textContent?.trim()).toBe('Build with clarity');
    expect(host.querySelector('.article-body p')?.textContent).toContain('Clarity is not');
    expect(host.textContent).toContain('All posts');
  });
});
