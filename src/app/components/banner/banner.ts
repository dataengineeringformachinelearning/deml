import { Component, computed, input } from '@angular/core';

export type BannerHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

@Component({
  selector: 'app-banner',
  imports: [],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner {
  /** Optional uppercase label above the heading. */
  readonly preheader = input<string>();

  /** Primary banner heading. */
  readonly heading = input<string>();

  /** Supporting lede copy under the heading. */
  readonly lede = input<string>();

  /** Heading level for document outline (defaults to page-level h1). */
  readonly headingLevel = input<BannerHeadingLevel>(1);

  /** Accessible id for the heading element. */
  readonly headingId = input('banner-heading');

  readonly labelledBy = computed(() => (this.heading() ? this.headingId() : null));
}
