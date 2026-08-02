import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';

export type MicrocardGridColumns = 2 | 3;

/**
 * Equal-height microcard bento on the 8px grid.
 * Project `<li>` children that wrap `app-microcard`.
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
  /** Column count from the medium breakpoint up (3 from large when set). */
  readonly columns = input<MicrocardGridColumns>(3);

  readonly ariaLabel = input<string>();
}
