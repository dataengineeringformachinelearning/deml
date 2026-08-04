import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from '../button/button';
import type { UptimeHistoryDataPoint } from '../../shared/deml-chart/types';

export type ExploreCardStatus =
  | 'operational'
  | 'degraded'
  | 'outage'
  | 'maintenance'
  | string;

export type ExploreCardMetric = {
  readonly label: string;
  readonly value: string;
  readonly meta?: string;
};

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-explore-card',
  imports: [Button, RouterLink],
  templateUrl: './explore-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExploreCard {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly href = input.required<string>();
  readonly status = input<ExploreCardStatus>('operational');
  readonly statusLabel = input('Operational');
  readonly tag = input('Public Status Page');
  readonly proVerified = input(false);
  readonly metrics = input<readonly ExploreCardMetric[]>([]);
  readonly uptimeHistory = input<readonly UptimeHistoryDataPoint[]>([]);
  readonly uptimePercentage = input<number | null>(null);
  readonly uptimeSummary = input('');

  pillStatus(): 'up' | 'down' | 'degraded' | 'maintenance' {
    const value = `${this.status()}`.toLowerCase();
    if (value.includes('outage') || value === 'down') return 'down';
    if (value.includes('degraded') || value.includes('partial')) return 'degraded';
    if (value.includes('maintenance')) return 'maintenance';
    return 'up';
  }

  uptimeDisplay(): string {
    const value = this.uptimePercentage();
    return value == null ? '—' : `${value.toFixed(2)}%`;
  }
}
