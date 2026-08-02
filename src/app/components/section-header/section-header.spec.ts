import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionHeader } from './section-header';

describe('SectionHeader', () => {
  let fixture: ComponentFixture<SectionHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionHeader);
    fixture.componentRef.setInput('heading', 'Overview');
    fixture.detectChanges();
  });

  it('renders a labelled heading', () => {
    const host = fixture.nativeElement as HTMLElement;
    const heading = host.querySelector('h2');
    expect(heading?.textContent?.trim()).toBe('Overview');
    expect(heading?.id).toBeTruthy();
  });

  it('renders eyebrow and lede when provided', () => {
    fixture.componentRef.setInput('eyebrow', 'Pulse');
    fixture.componentRef.setInput('lede', 'Last 28 days');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.section-header-eyebrow')?.textContent?.trim()).toBe('Pulse');
    expect(host.querySelector('.section-header-lede')?.textContent?.trim()).toBe('Last 28 days');
  });
});
