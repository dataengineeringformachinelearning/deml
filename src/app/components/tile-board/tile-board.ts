import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

import type { DashTile } from '../../data/dashboard';
import { AreaChart } from '../area-chart/area-chart';
import { BarChart } from '../bar-chart/bar-chart';
import { ChartCard } from '../chart-card/chart-card';
import { DashboardGrid } from '../dashboard-grid/dashboard-grid';
import { MetricList } from '../metric-list/metric-list';
import { StatCard } from '../stat-card/stat-card';

/**
 * Dynamically renders a typed tile list into the shared dashboard grid.
 * Pages pass data; this component owns the chart/card composition.
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-tile-board',
  imports: [DashboardGrid, StatCard, ChartCard, AreaChart, BarChart, MetricList],
  templateUrl: './tile-board.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TileBoard {
  readonly tiles = input.required<readonly DashTile[]>();
}
