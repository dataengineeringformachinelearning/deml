// CHART RULES LOCKED: height fixed, width 100%, shared global scale – DO NOT CHANGE
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';

import type { DashTile } from '../../data/dashboard';
import { AreaChart } from '../area-chart/area-chart';
import { BarChart } from '../bar-chart/bar-chart';
import { ChartCard } from '../chart-card/chart-card';
import { computeSharedDomain, type ChartDomain } from '../dashboard/chart-scale';
import type { DashPoint } from '../dashboard/dashboard.types';
import { DashboardGrid } from '../dashboard-grid/dashboard-grid';
import { MetricList } from '../metric-list/metric-list';
import { StatCard } from '../stat-card/stat-card';

/**
 * Dynamically renders a typed tile list into the shared dashboard grid.
 * Computes one shared y-domain from every line series on the board.
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

  /** Global min/max of all spark + area series on this board. */
  readonly sharedDomain = computed<ChartDomain>(() => {
    const series: DashPoint[][] = [];
    for (const tile of this.tiles()) {
      if (tile.kind === 'stat' && tile.sparkline && tile.sparkline.length > 1) {
        series.push([...tile.sparkline]);
      }
      if (tile.kind === 'area') {
        series.push([...tile.points]);
      }
    }
    return computeSharedDomain(series);
  });
}
