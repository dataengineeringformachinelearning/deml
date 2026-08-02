import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { CardVisual } from '../card/card';

export type MicrocardHeadingLevel = 2 | 3 | 4 | 5 | 6;

let microcardIdSeq = 0;

@Component({
  selector: 'app-microcard',
  imports: [RouterLink],
  templateUrl: './microcard.html',
  styleUrl: './microcard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-visual]': 'visual()',
  },
})
export class Microcard {
  private readonly autoId = `microcard-heading-${++microcardIdSeq}`;

  readonly heading = input.required<string>();

  readonly subtext = input<string>();

  readonly meta = input<string>();

  readonly visual = input<Exclude<CardVisual, 'none'>>('gold');

  readonly headingLevel = input<MicrocardHeadingLevel>(3);

  readonly headingId = input<string>();

  /** Router destination for the card. */
  readonly routerLink = input.required<string | readonly string[]>();

  /** CTA label shown on the card. */
  readonly cta = input('Learn');

  readonly resolvedHeadingId = computed(() => this.headingId() || this.autoId);
}
