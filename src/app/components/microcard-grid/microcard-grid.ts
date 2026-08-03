import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';

export type MicrocardGridColumns = 1 | 2 | 3 | 4;

/**
 * Equal-height microcard bento on the 8px grid.
 * Project `<li>` children that wrap `app-microcard`.
 * `1` = 100/100 full-width stack; `4` = 25/100 catalog.
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-microcard-grid',
  templateUrl: './microcard-grid.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-columns]': 'columns()',
  },
})
export class MicrocardGrid {
  /** Column count (1 = full width; 2 from md; 3/4 from lg). */
  readonly columns = input<MicrocardGridColumns>(4);

  readonly ariaLabel = input<string>();
}
