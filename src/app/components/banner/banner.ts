import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';

export type BannerHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

let bannerIdSeq = 0;

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-banner',
  templateUrl: './banner.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Banner {
  private readonly autoId = `banner-heading-${++bannerIdSeq}`;

  /** Optional uppercase label above the heading. */
  readonly preheader = input<string>();

  /** Primary banner heading. */
  readonly heading = input<string>();

  /** Supporting lede copy under the heading. */
  readonly lede = input<string>();

  /** Heading level for document outline (defaults to page-level h1). */
  readonly headingLevel = input<BannerHeadingLevel>(1);

  /** Accessible id for the heading element. */
  readonly headingId = input<string>();

  readonly resolvedHeadingId = computed(() => this.headingId() || this.autoId);

  readonly labelledBy = computed(() => (this.heading() ? this.resolvedHeadingId() : null));
}
