import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LEARN_TOPICS, PACKAGE_GROUPS } from '../../data/packages';
import { Learn } from './learn';

describe('Learn', () => {
  let fixture: ComponentFixture<Learn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Learn],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Learn);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render microcards for each package topic', () => {
    const host = fixture.nativeElement as HTMLElement;
    const groupTitles = Array.from(
      host.querySelectorAll('.catalog-group .section-header-heading'),
    ).map((el) => el.textContent?.trim());
    const cards = host.querySelectorAll('app-microcard');

    expect(host.querySelector('h1.banner-heading')?.textContent).toContain('Learn');
    expect(groupTitles).toEqual(PACKAGE_GROUPS.map((group) => group.title));
    expect(cards.length).toBe(LEARN_TOPICS.length);
    expect(host.querySelector('a.microcard')?.getAttribute('href')).toContain('/learn/');
    expect(host.textContent).toContain('fastapi');
    expect(host.textContent).toContain('Dragonfly');
  });
});
