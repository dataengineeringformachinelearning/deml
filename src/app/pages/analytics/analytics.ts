import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Banner } from '../../components/banner/banner';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { StatCard } from '../../components/stat-card/stat-card';
import { DashboardGrid } from '../../components/dashboard-grid/dashboard-grid';
import { AnalyticsQueryService } from '../../services/analytics-query.service';

@Component({
  selector: 'app-analytics',
  imports: [Banner, PageSection, SectionHeader, StatCard, DashboardGrid],
  templateUrl: './analytics.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Analytics implements OnInit {
  private readonly analytics = inject(AnalyticsQueryService);
  readonly note = signal('Threat and traffic analytics via the DEML control plane.');
  readonly metrics = signal([
    { label: 'Surface', value: 'Analytics' },
    { label: 'State', value: 'Live' },
    { label: 'Source', value: 'BFF' },
  ]);

  ngOnInit(): void {
    // AnalyticsQueryService ready for BFF queries
  }
}
