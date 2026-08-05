// CHART RULES LOCKED: height fixed, width 100%, shared global scale – DO NOT CHANGE
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';

import type { DashAccent, DashSize } from '../dashboard/dashboard.types';

export type ChartCardHeadingLevel = 2 | 3 | 4 | 5 | 6;

let chartCardIdSeq = 0;

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-chart-card',
  templateUrl: './chart-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-accent]': 'accent()',
  },
})
export class ChartCard {
  private readonly autoId = `chart-card-${++chartCardIdSeq}`;

  readonly heading = input.required<string>();

  readonly meta = input<string>();

  readonly size = input<DashSize>('md');

  readonly accent = input<DashAccent>('primary');

  readonly headingLevel = input<ChartCardHeadingLevel>(3);

  readonly headingId = input<string>();

  readonly resolvedHeadingId = computed(() => this.headingId() || this.autoId);
}
