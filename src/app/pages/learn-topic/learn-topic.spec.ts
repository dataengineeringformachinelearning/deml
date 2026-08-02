import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LearnTopicPage } from './learn-topic';

describe('LearnTopicPage', () => {
  let fixture: ComponentFixture<LearnTopicPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearnTopicPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LearnTopicPage);
    fixture.componentRef.setInput('slug', 'fastapi');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should render shared article template for a topic', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('h1.banner-heading')?.textContent?.trim()).toBe('fastapi');
    expect(host.querySelector('.article-body p')?.textContent).toContain('direct dependency');
    expect(host.textContent).toContain('Star on GitHub');
    expect(host.textContent).toContain('All topics');
  });
});
