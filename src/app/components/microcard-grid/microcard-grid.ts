import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type MicrocardGridColumns = 2 | 3;

/**
 * Equal-height microcard bento on the 8px grid.
 * Project `<li>` children that wrap `app-microcard`.
 */
@Component({
  selector: 'app-microcard-grid',
  templateUrl: './microcard-grid.html',
  styleUrl: './microcard-grid.css',
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
