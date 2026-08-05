// CHART RULES LOCKED: height fixed, width 100%, shared global scale – DO NOT CHANGE
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { LucideTrendingDown, LucideTrendingUp } from '@lucide/angular';

import { AreaChart } from '../area-chart/area-chart';
import type { ChartDomain } from '../dashboard/chart-scale';
import type { DashAccent, DashPoint, DashSize } from '../dashboard/dashboard.types';

let statCardIdSeq = 0;

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-stat-card',
  imports: [AreaChart, LucideTrendingDown, LucideTrendingUp],
  templateUrl: './stat-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-accent]': 'accent()',
    '[attr.data-trend]': 'trend()',
  },
})
export class StatCard {
  private readonly autoId = `stat-card-${++statCardIdSeq}`;

  /** Large KPI value (preformatted). */
  readonly value = input.required<string>();

  /** Short label above / beside the value. */
  readonly label = input.required<string>();

  /** Optional supporting line. */
  readonly meta = input<string>();

  /** Signed delta label, e.g. "+12%" or "-3%". */
  readonly delta = input<string>();

  readonly size = input<DashSize>('sm');

  readonly accent = input<DashAccent>('primary');

  /** Optional sparkline series. */
  readonly sparkline = input<readonly DashPoint[]>();

  /** Shared board y-domain — required when a sparkline is shown. */
  readonly domain = input<ChartDomain | null>(null);

  readonly labelId = input<string>();

  readonly resolvedLabelId = computed(() => this.labelId() || this.autoId);

  readonly trend = computed<'up' | 'down' | 'flat'>(() => {
    const delta = this.delta()?.trim() ?? '';
    if (delta.startsWith('-')) {
      return 'down';
    }
    if (delta.startsWith('+')) {
      return 'up';
    }
    return 'flat';
  });

  readonly hasSparkline = computed(() => (this.sparkline()?.length ?? 0) > 1);
}
