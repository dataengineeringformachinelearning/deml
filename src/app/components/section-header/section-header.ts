import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SectionHeadingLevel = 2 | 3 | 4 | 5 | 6;

let sectionHeaderIdSeq = 0;

/**
 * Reusable page-section intro: optional tracked eyebrow,
 * bold heading, and tracked lede — all on the 8px grid.
 */
@Component({
  selector: 'app-section-header',
  templateUrl: './section-header.html',
  styleUrl: './section-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeader {
  private readonly autoId = `section-heading-${++sectionHeaderIdSeq}`;

  /** Optional uppercase eyebrow above the heading. */
  readonly eyebrow = input<string>();

  /** Section heading (required for labelled regions). */
  readonly heading = input.required<string>();

  /** Supporting intro copy. */
  readonly lede = input<string>();

  /** Heading level for document outline (defaults to h2). */
  readonly headingLevel = input<SectionHeadingLevel>(2);

  /** Accessible id for the heading element. */
  readonly headingId = input<string>();

  readonly resolvedHeadingId = computed(() => this.headingId() || this.autoId);

  readonly labelledBy = computed(() => this.resolvedHeadingId());
}
