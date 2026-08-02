import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { DashAccent, DashBarItem } from '../dashboard/dashboard.types';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-accent]': 'accent()',
  },
})
export class BarChart {
  readonly items = input.required<readonly DashBarItem[]>();

  readonly accent = input<DashAccent>('primary');

  readonly ariaLabel = input('Bar chart');

  readonly rows = computed(() => {
    const items = this.items();
    const max = Math.max(...items.map((i) => i.value), 1);
    return items.map((item) => ({
      ...item,
      display: item.display ?? item.value.toLocaleString(),
      pct: Math.max(4, Math.round((item.value / max) * 100)),
    }));
  });
}
