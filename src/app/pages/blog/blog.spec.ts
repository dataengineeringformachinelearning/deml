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

  it('should render microcards for each post', () => {
    const host = fixture.nativeElement as HTMLElement;
    const cards = host.querySelectorAll('app-microcard');

    expect(host.querySelector('h1.banner-heading')?.textContent).toContain('Blog');
    expect(cards.length).toBe(BLOG_POSTS.length);
    expect(host.querySelector('.microcard-meta')?.textContent).toContain('Jul 2026');
    expect(host.textContent).toContain('Build with clarity');
    expect(host.querySelector('.microcard-cta')?.textContent?.trim()).toBe('Read');
  });
});
