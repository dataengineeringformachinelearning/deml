import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import { Card } from '../../components/card/card';
import { CardGrid } from '../../components/card-grid/card-grid';
import { ChartCard } from '../../components/chart-card/chart-card';
import { DashboardGrid } from '../../components/dashboard-grid/dashboard-grid';
import { MetricList } from '../../components/metric-list/metric-list';
import { SectionHeader } from '../../components/section-header/section-header';
import { StatCard } from '../../components/stat-card/stat-card';
import { ACCOUNT_ACTIVITY, ACCOUNT_PREF_CARDS } from '../../data/account';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-account',
  imports: [
    Banner,
    Button,
    ButtonGroup,
    SectionHeader,
    DashboardGrid,
    StatCard,
    ChartCard,
    MetricList,
    CardGrid,
    Card,
  ],
  templateUrl: './account.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Account {
  private readonly themeService = inject(ThemeService);

  readonly isDark = this.themeService.isDark;
  readonly prefs = ACCOUNT_PREF_CARDS;
  readonly activity = ACCOUNT_ACTIVITY;

  toggleTheme(): void {
    this.themeService.toggle();
  }
}
