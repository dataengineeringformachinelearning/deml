import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type CardVisual = 'none' | 'gold' | 'red' | 'olive';
export type CardHeadingLevel = 2 | 3 | 4 | 5 | 6;
/** `feature` = centered product card; `teaser` = full-width blog/list row. */
export type CardLayout = 'feature' | 'teaser';

let cardIdSeq = 0;

@Component({
  selector: 'app-card',
  templateUrl: './card.html',
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-visual]': 'visual()',
    '[attr.data-layout]': 'layout()',
  },
})
export class Card {
  private readonly autoId = `card-heading-${++cardIdSeq}`;

  /** Card title. */
  readonly heading = input.required<string>();

  /** Supporting line under the heading. */
  readonly subtext = input<string>();

  /** Optional meta line (date, category) above the heading. */
  readonly meta = input<string>();

  /** Heading level for document outline (defaults to h3 under a section h2). */
  readonly headingLevel = input<CardHeadingLevel>(3);

  /** Accessible id for the heading. */
  readonly headingId = input<string>();

  /** Optional crest-toned media wash when no projected media is used. */
  readonly visual = input<CardVisual>('none');

  /** Layout variant. */
  readonly layout = input<CardLayout>('feature');

  readonly resolvedHeadingId = computed(() => this.headingId() || this.autoId);
}
