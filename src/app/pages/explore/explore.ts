import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import {
  ExploreCard,
  type ExploreCardMetric,
  type ExploreCardStatus,
} from '../../components/explore-card/explore-card';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { toUptimeHistoryDataPoints } from '../../core/utils/uptime.utils';
import { AuthService } from '../../services/auth.service';
import { MlService } from '../../services/ml.service';
import {
  MonitorService,
  publicStatusPageTag,
  type StatusPageData,
} from '../../services/monitor.service';
import type { UptimeHistoryDataPoint } from '../../shared/deml-chart/types';

@Component({
  selector: 'app-explore',
  imports: [Banner, Button, ExploreCard, PageSection, SectionHeader],
  templateUrl: './explore.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Explore implements OnInit {
  private readonly monitor = inject(MonitorService);
  private readonly ml = inject(MlService);
  private readonly auth = inject(AuthService);
  private readonly injector = inject(Injector);

  readonly statusPages = signal<StatusPageData[]>([]);
  readonly loadFailed = signal(false);
  readonly isLoading = signal(true);
  readonly isRetrying = signal(false);

  private readonly loadingPlaceholder: StatusPageData = {
    id: 'loading-placeholder',
    title: 'Loading Directory…',
    slug: 'loading',
    description: 'Fetching public status pages from the platform directory…',
    created_at: new Date().toISOString(),
    user_id: null,
  };

  readonly displayPages = computed(() => {
    if (this.isLoading() && !this.loadFailed()) {
      return [this.loadingPlaceholder];
    }
    return this.statusPages();
  });

  constructor() {
    afterNextRender(() => {
      effect(
        () => {
          if (this.auth.isInitialized()) {
            this.loadData();
          }
        },
        { injector: this.injector },
      );
    });
  }

  ngOnInit(): void {
    /* Meta titles come from route + page-meta; directory loads after auth init. */
  }

  pageTag(page: StatusPageData): string {
    return publicStatusPageTag(page.slug);
  }

  getPageUrl(page: StatusPageData): string {
    return `/status/${page.slug}`;
  }

  getPageStatus(page: StatusPageData): ExploreCardStatus {
    const active = (this.monitor.incidentsMap()[page.id] || []).filter(
      incident => incident.status !== 'Resolved',
    );
    if (active.length > 0) {
      return active[0].status;
    }
    const services = this.monitor.servicesMap()[page.id] || page.services || [];
    const normalized = (status?: string | null) =>
      (status || 'operational').toLowerCase().replace(/[\s-]+/g, '_');
    if (
      services.some(service => {
        const value = normalized(service.status);
        return value === 'outage' || value === 'major_outage' || value === 'down';
      })
    ) {
      return 'Outage';
    }
    if (
      services.some(service => {
        const value = normalized(service.status);
        return value === 'degraded' || value === 'partial_outage' || value === 'partial';
      })
    ) {
      return 'Degraded';
    }
    if (services.some(service => normalized(service.status) === 'maintenance')) {
      return 'Maintenance';
    }
    return 'operational';
  }

  getPageStatusLabel(page: StatusPageData): string {
    const status = `${this.getPageStatus(page)}`.toLowerCase();
    if (status === 'operational' || status === 'up') return 'Operational';
    if (status === 'degraded' || status === 'partial outage') return 'Degraded';
    if (status === 'maintenance') return 'Maintenance';
    if (status === 'outage' || status === 'major outage' || status === 'down') return 'Outage';
    return `${this.getPageStatus(page)}`;
  }

  uptimeSummary(page: StatusPageData): string {
    const label = this.getPageStatusLabel(page);
    return label === 'Operational' ? 'No current issues' : label;
  }

  overallUptime(page: StatusPageData): number | null {
    return page.overall_uptime ?? page.cumulative_sla ?? null;
  }

  exploreMetrics(page: StatusPageData): readonly ExploreCardMetric[] {
    const threatReport = this.ml.latestThreatReports()[page.id];
    const spikeRisk = this.ml.latestTemporalForecasts()[page.id];
    const sla = page.cumulative_sla ?? page.overall_uptime ?? null;
    const latency = page.p99_latency;
    const anomaly = threatReport?.anomaly_score;
    const usesNorse = this.ml.latestTemporalUsesNorse()[page.id];
    const norseLabel =
      usesNorse === true ? 'Active' : usesNorse === false ? 'MLP Fallback' : 'Pending';

    return [
      {
        label: 'Cumulative SLA',
        value: sla == null ? '—' : `${sla.toFixed(2)}%`,
        meta: 'Based on real telemetry',
      },
      {
        label: 'P99 Latency',
        value: latency == null ? '—' : `${latency}ms`,
        meta: 'Last 24h',
      },
      {
        label: 'Spike Risk',
        value: spikeRisk == null ? '—' : spikeRisk.toFixed(2),
        meta: 'Dynamic Temporal Forecasting',
      },
      {
        label: 'Threat Anomaly',
        value: anomaly == null ? '—' : `${(anomaly * 100).toFixed(2)}%`,
        meta: norseLabel,
      },
    ];
  }

  exploreUptimeHistory(page: StatusPageData): readonly UptimeHistoryDataPoint[] {
    const history = page.uptime_history ?? [];
    if (history.length > 0) {
      return toUptimeHistoryDataPoints(history);
    }
    return [];
  }

  loadData(): void {
    this.isLoading.set(true);
    this.loadFailed.set(false);
    this.monitor.getStatusPages().subscribe({
      next: data => {
        if (!Array.isArray(data)) return;
        const publicPages = data.filter(p => p.is_published || p.slug === 'platform-status');
        const hydrations = publicPages.map(page =>
          this.monitor.getStatusPageBySlug(page.slug).pipe(
            map(hydrated => ({ ...page, ...hydrated, id: hydrated.id || page.id })),
            catchError(() => of(page)),
          ),
        );

        const applyPages = (pages: StatusPageData[]) => {
          this.statusPages.set(pages);
          for (const page of pages) {
            this.monitor.seedFromEmbeddedPage(page);
            this.ml.seedFromStatusPage(page);
            if (this.auth.isAuthenticated()) {
              this.ml.fetchLatestStat(page.id);
              this.ml.fetchThreatReport(page.id);
              this.ml.fetchTemporalForecast(page.id);
            }
          }
          if (this.auth.isAuthenticated()) {
            this.monitor.fetchAllIncidents(pages);
            this.monitor.fetchAllServices(pages);
          }
          this.isLoading.set(false);
        };

        if (hydrations.length === 0) {
          applyPages([]);
          return;
        }

        forkJoin(hydrations).subscribe({
          next: applyPages,
          error: () => applyPages(publicPages),
        });
      },
      error: () => {
        this.statusPages.set([]);
        this.loadFailed.set(true);
        this.isLoading.set(false);
      },
    });
  }

  retryLoad(): void {
    this.isRetrying.set(true);
    this.loadData();
  }
}
