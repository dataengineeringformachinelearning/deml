import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AreaChart } from '../../components/area-chart/area-chart';
import { Banner } from '../../components/banner/banner';
import { BarChart } from '../../components/bar-chart/bar-chart';
import { ChartCard } from '../../components/chart-card/chart-card';
import { DashboardGrid } from '../../components/dashboard-grid/dashboard-grid';
import { MetricList } from '../../components/metric-list/metric-list';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { StatCard } from '../../components/stat-card/stat-card';
import { DASH_TILES } from '../../data/dashboard';

@Component({
  selector: 'app-dashboard',
  imports: [
    Banner,
    PageSection,
    SectionHeader,
    DashboardGrid,
    StatCard,
    ChartCard,
    AreaChart,
    BarChart,
    MetricList,
  ],
  templateUrl: './dashboard.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  readonly tiles = DASH_TILES;
}
