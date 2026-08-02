import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { BarChart } from '../../components/bar-chart/bar-chart';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { Card } from '../../components/card/card';
import { CardGrid } from '../../components/card-grid/card-grid';
import { ChartCard } from '../../components/chart-card/chart-card';
import { DashboardGrid } from '../../components/dashboard-grid/dashboard-grid';
import { MetricList } from '../../components/metric-list/metric-list';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { StatCard } from '../../components/stat-card/stat-card';
import { SITE_CARDS, SITE_TILES } from '../../data/sites';

@Component({
  selector: 'app-sites',
  imports: [
    Banner,
    Button,
    ButtonGroup,
    PageSection,
    SectionHeader,
    DashboardGrid,
    StatCard,
    ChartCard,
    BarChart,
    MetricList,
    CardGrid,
    Card,
  ],
  templateUrl: './sites.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sites {
  readonly sites = SITE_CARDS;
  readonly tiles = SITE_TILES;
}
