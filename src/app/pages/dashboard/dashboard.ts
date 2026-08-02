import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AreaChart } from '../../components/area-chart/area-chart';
import { Banner } from '../../components/banner/banner';
import { BarChart } from '../../components/bar-chart/bar-chart';
import { ChartCard } from '../../components/chart-card/chart-card';
import { DashboardGrid } from '../../components/dashboard-grid/dashboard-grid';
import { MetricList } from '../../components/metric-list/metric-list';
import { SectionHeader } from '../../components/section-header/section-header';
import { StatCard } from '../../components/stat-card/stat-card';
import {
  DASH_DEVICE_MIX,
  DASH_ENGAGEMENT_SPARK,
  DASH_LISTENERS_WEEK,
  DASH_RETENTION_SPARK,
  DASH_SESSIONS_MONTH,
  DASH_TOP_CHANNELS,
  DASH_TOP_CONTENT,
} from '../../data/dashboard';

@Component({
  selector: 'app-dashboard',
  imports: [
    Banner,
    SectionHeader,
    DashboardGrid,
    StatCard,
    ChartCard,
    AreaChart,
    BarChart,
    MetricList,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  readonly listenersWeek = DASH_LISTENERS_WEEK;
  readonly sessionsMonth = DASH_SESSIONS_MONTH;
  readonly engagementSpark = DASH_ENGAGEMENT_SPARK;
  readonly retentionSpark = DASH_RETENTION_SPARK;
  readonly topChannels = DASH_TOP_CHANNELS;
  readonly topContent = DASH_TOP_CONTENT;
  readonly deviceMix = DASH_DEVICE_MIX;
}
