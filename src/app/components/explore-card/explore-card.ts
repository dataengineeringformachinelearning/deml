import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import type { UptimeHistoryDataPoint } from '../../shared/deml-chart/types';

export type ExploreCardStatus =
  | 'operational'
  | 'degraded'
  | 'outage'
  | 'maintenance'
  | string;

export type ExploreCardLayout = 'directory' | 'detail';

export type ExploreCardService = {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly status: string;
  readonly statusLabel: string;
};

export type ExploreCardIncident = {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly status: string;
  readonly updatedAt: string;
};

/** Calm status card — pill, title, uptime; detail adds services + incidents. */
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
  readonly services = input<readonly ExploreCardService[]>([]);
  readonly incidents = input<readonly ExploreCardIncident[]>([]);
  readonly uptimeHistory = input<readonly UptimeHistoryDataPoint[]>([]);
  readonly uptimePercentage = input<number | null>(null);
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
