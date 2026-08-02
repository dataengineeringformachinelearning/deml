import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BLOG_POSTS } from '../../data/blog-posts';
import { Blog } from './blog';

describe('Blog', () => {
  let fixture: ComponentFixture<Blog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Blog],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Blog);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render full-width teaser cards for each post', () => {
    const host = fixture.nativeElement as HTMLElement;
    const teasers = host.querySelectorAll('app-card[data-layout="teaser"]');

    expect(host.querySelector('h1.banner-heading')?.textContent).toContain('Blog');
    expect(teasers.length).toBe(BLOG_POSTS.length);
    expect(host.querySelector('.card-meta')?.textContent).toContain('Jul 2026');
    expect(host.textContent).toContain('Build with clarity');
  });
});
