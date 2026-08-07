import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import type { UptimeHistoryDataPoint } from '../../core/utils/uptime.utils';

export type ExploreCardStatus =
  | 'operational'
  | 'degraded'
  | 'outage'
  | 'maintenance'
  | string;

export type ExploreCardLayout = 'directory' | 'detail';

export type ExploreCardMetric = {
  readonly label: string;
  readonly value: string;
  readonly meta?: string;
};

export type ExploreCardMetricGroup = {
  readonly id: string;
  readonly heading: string;
  readonly metrics: readonly ExploreCardMetric[];
};

export type ExploreCardService = {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly status: string;
  readonly statusLabel: string;
  readonly metrics?: readonly ExploreCardMetric[];
  readonly uptimeHistory?: readonly UptimeHistoryDataPoint[];
  readonly uptimePercentage?: number | null;
  readonly uptimeSummary?: string;
};

export type ExploreCardIncident = {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly status: string;
  readonly updatedAt: string;
};

/** Status mega-card — pill, title, selling-point stats, uptime; detail adds groups/services. */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-explore-card',
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './explore-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExploreCard {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly href = input<string | null>(null);
  readonly layout = input<ExploreCardLayout>('directory');
  readonly status = input<ExploreCardStatus>('operational');
  readonly statusLabel = input('Operational');
  readonly tag = input('Public Status Page');
  readonly proVerified = input(false);
  readonly metrics = input<readonly ExploreCardMetric[]>([]);
  readonly metricGroups = input<readonly ExploreCardMetricGroup[]>([]);
  readonly services = input<readonly ExploreCardService[]>([]);
  readonly incidents = input<readonly ExploreCardIncident[]>([]);
  readonly uptimeHistory = input<readonly UptimeHistoryDataPoint[]>([]);
  readonly uptimePercentage = input<number | null>(null);
  readonly uptimeSummary = input('');
  readonly uptimeLabel = input('Uptime');

  pillStatus(): 'up' | 'down' | 'degraded' | 'maintenance' {
    const value = `${this.status()}`.toLowerCase();
    if (value.includes('outage') || value === 'down') return 'down';
    if (value.includes('degraded') || value.includes('partial')) return 'degraded';
    if (value.includes('maintenance')) return 'maintenance';
    return 'up';
  }

  servicePillStatus(status: string): 'up' | 'down' | 'degraded' | 'maintenance' {
    const value = status.toLowerCase();
    if (value.includes('outage') || value === 'down') return 'down';
    if (value.includes('degraded') || value.includes('partial')) return 'degraded';
    if (value.includes('maintenance')) return 'maintenance';
    return 'up';
  }

  uptimeDisplay(value: number | null = this.uptimePercentage()): string {
    return value == null ? '—' : `${value.toFixed(2)}%`;
  }
}
