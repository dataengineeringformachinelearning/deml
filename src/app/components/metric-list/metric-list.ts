import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';

import type { DashAccent, DashMetricItem } from '../dashboard/dashboard.types';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-metric-list',
  templateUrl: './metric-list.html',
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
