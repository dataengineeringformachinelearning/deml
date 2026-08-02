import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { DashAccent, DashMetricItem } from '../dashboard/dashboard.types';

@Component({
  selector: 'app-metric-list',
  templateUrl: './metric-list.html',
  styleUrl: './metric-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-accent]': 'accent()',
  },
})
export class MetricList {
  readonly items = input.required<readonly DashMetricItem[]>();

  readonly accent = input<DashAccent>('primary');

  readonly ariaLabel = input('Ranked metrics');
}
