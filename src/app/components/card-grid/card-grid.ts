import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';

export type CardGridColumns = 2 | 3;

/**
 * Equal-height card board. Default is 50/50 (2 columns from md up).
 * Set columns=3 only when a page intentionally wants a 3-up catalog.
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-card-grid',
  templateUrl: './card-grid.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-columns]': 'columns()',
  },
})
export class CardGrid {
  readonly columns = input<CardGridColumns>(2);
}
