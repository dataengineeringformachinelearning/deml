import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Article } from './article';
import { Button } from '../button/button';

@Component({
  selector: 'app-host',
  imports: [Article, Button],
  template: `
    <app-article
      title="fastapi"
      lede="Backend (Python)"
      [body]="['API framework paragraph.']"
      backLink="/learn"
      backLabel="All topics"
    >
      <app-button variant="primary" shape="pill" href="https://github.com/fastapi/fastapi">
        Star on GitHub
      </app-button>
    </app-article>
  `,
})
class Host {}

@Component({
  selector: 'app-missing-host',
  imports: [Article],
  template: `
    <app-article
      backLink="/blog"
      backLabel="Back to blog"
      missingHeading="Post not found"
      missingLede="That note is not in the archive."
    />
  `,
})
class MissingHost {}

describe('Article', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host, MissingHost],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render shared detail body and projected actions', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('h1.banner-heading')?.textContent?.trim()).toBe('fastapi');
    expect(host.querySelector('.article-body p')?.textContent).toContain('API framework');
    expect(host.textContent).toContain('All topics');
    expect(host.textContent).toContain('Star on GitHub');
  });

  it('should render missing state when title is absent', async () => {
    const fixture = TestBed.createComponent(MissingHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('h1.banner-heading')?.textContent?.trim()).toBe('Post not found');
    expect(host.textContent).toContain('Back to blog');
    // Missing state keeps the shared page-body shell for layout stability.
    expect(host.querySelector('.article-body')).toBeTruthy();
    expect(host.querySelector('.article-body p')).toBeNull();
  });
});
