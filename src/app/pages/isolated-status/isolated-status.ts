import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  afterNextRender,
  computed,
  effect,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { timeout } from 'rxjs';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button-group/button-group';
import {
  ExploreCard,
  type ExploreCardIncident,
  type ExploreCardMetricGroup,
  type ExploreCardService,
  type ExploreCardStatus,
} from '../../components/explore-card/explore-card';
import { PageSection } from '../../components/page-section/page-section';
import { SectionHeader } from '../../components/section-header/section-header';
import { formatLatencyMs, formatServiceName } from '../../core/utils/formatter.utils';
import { resolveUptimeHistory } from '../../core/utils/uptime.utils';
import { AuthService } from '../../services/auth.service';
import { MlService } from '../../services/ml.service';
import {
  MonitorService,
  publicStatusPageTag,
  type MonitoredServiceData,
  type StatusPageData,
} from '../../services/monitor.service';

@Component({
  selector: 'app-isolated-status',
  imports: [
    Banner,
    Button,
    ButtonGroup,
    ExploreCard,
    PageSection,
    SectionHeader,
    RouterLink,
  ],
  templateUrl: './isolated-status.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsolatedStatus implements OnInit {
  private readonly monitor = inject(MonitorService);
  private readonly ml = inject(MlService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);

  readonly slug = signal('');
  readonly page = signal<StatusPageData | null>(null);
  readonly loadFailed = signal(false);
  readonly loadErrorKind = signal<'network' | 'not_found' | 'forbidden' | null>(null);
  readonly isLoading = signal(true);
  readonly isRetrying = signal(false);

  readonly globalStatus = computed((): ExploreCardStatus => {
    const current = this.page();
    if (!current) return 'operational';
    const pageId = current.id;
    const active = (this.monitor.incidentsMap()[pageId] || []).filter(
      incident => incident.status !== 'Resolved',
    );
    const services = this.monitor.servicesMap()[pageId] || current.services || [];
    const httpServices = services.filter(service => service.name !== 'Event Projections');
    if (
      active.length > 0 ||
      httpServices.some(service => {
        const value = (service.status || '').toLowerCase();
        return value.includes('outage') || value === 'down';
      })
    ) {
      return 'Outage';
    }
    if (
      services.some(service => {
        const value = (service.status || '').toLowerCase();
        return value.includes('degraded') || value.includes('partial');
      })
    ) {
      return 'Degraded';
    }
    return 'operational';
  });

  readonly statusLabel = computed(() => {
    const status = `${this.globalStatus()}`.toLowerCase();
    if (status === 'operational' || status === 'up') return 'Operational';
    if (status.includes('degraded')) return 'Degraded';
    if (status.includes('maintenance')) return 'Maintenance';
    if (status.includes('outage') || status === 'down') return 'Outage';
    return `${this.globalStatus()}`;
  });

  readonly statusDescription = computed(() => {
    const label = this.statusLabel();
    if (label === 'Operational') return 'All systems are functioning normally.';
    if (label === 'Degraded') return 'Some services are experiencing degraded performance.';
    if (label === 'Maintenance') return 'Planned maintenance is currently in progress.';
    return 'Some services are currently experiencing downtime.';
  });

  readonly metricGroups = computed((): readonly ExploreCardMetricGroup[] => {
    const current = this.page();
    if (!current) return [];
    const threat = this.ml.latestThreatReports()[current.id];
    const predictedSla = this.ml.latestStats()[current.id];
    const spikeRisk = this.ml.latestTemporalForecasts()[current.id];
    const usesNorse = this.ml.latestTemporalUsesNorse()[current.id];
    const norseLabel =
      usesNorse === true ? 'Active' : usesNorse === false ? 'MLP Fallback' : 'Pending';

    return [
      {
        id: 'analytics',
        heading: 'Analytics & service level',
        metrics: [
          {
            label: 'P99 Latency',
            value: formatLatencyMs(current.p99_latency),
            meta: 'Last 24 hours',
          },
          {
            label: 'Total Requests',
            value:
              current.total_requests == null
                ? '—'
                : new Intl.NumberFormat('en-US').format(current.total_requests),
            meta: 'Last 24 hours',
          },
          {
            label: 'Cumulative SLA',
            value: this.formatUptimePct(current.cumulative_sla ?? current.overall_uptime),
            meta: 'Based on real telemetry',
          },
          {
            label: 'Predicted SLA',
            value: this.formatUptimePct(predictedSla),
            meta: '30-day forecast via ML',
          },
        ],
      },
      {
        id: 'intelligence',
        heading: 'Predictive intelligence',
        metrics: [
          {
            label: 'Dynamic Temporal Forecasting',
            value: norseLabel,
            meta: 'Temporal inference engine',
          },
          {
            label: 'Spike Risk',
            value: this.formatOptionalScore(spikeRisk),
            meta: 'Telemetry sequence score',
          },
          {
            label: 'Cumulative TA',
            value: this.formatOptionalPercentRatio(threat?.suspicious_ratio),
            meta: 'Based on real telemetry',
          },
          {
            label: 'Predicted TA',
            value: this.formatOptionalPercentRatio(threat?.anomaly_score),
            meta: '30-day threat forecast',
          },
        ],
      },
    ];
  });

  readonly services = computed((): readonly ExploreCardService[] => {
    const current = this.page();
    if (!current) return [];
    const list = this.monitor.servicesMap()[current.id] || current.services || [];
    return list.map(service => this.toServiceCard(current, service));
  });

  readonly incidents = computed((): readonly ExploreCardIncident[] => {
    const current = this.page();
    if (!current) return [];
    const list = this.monitor.incidentsMap()[current.id] || current.incidents || [];
    return list.map(incident => ({
      id: incident.id || incident.title,
      title: incident.title,
      message: incident.message,
      status: incident.status,
      updatedAt: incident.updated_at || incident.created_at,
    }));
  });

  readonly uptimeHistory = computed(() => {
    const current = this.page();
    return current ? resolveUptimeHistory(current.uptime_history) : [];
  });

  readonly uptimePercentage = computed(() => {
    const current = this.page();
    return current?.overall_uptime ?? current?.cumulative_sla ?? null;
  });

  readonly uptimeSummary = computed(() => {
    if (this.uptimePercentage() == null) return 'Awaiting probe history';
    return this.statusLabel() === 'Operational' ? 'No current issues' : this.statusLabel();
  });

  constructor() {
    afterNextRender(() => {
      effect(
        () => {
          const currentSlug = this.slug();
          if (currentSlug && this.auth.isInitialized()) {
            this.loadPage(currentSlug);
          }
        },
        { injector: this.injector },
      );
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.slug.set(String(params.get('slug') ?? ''));
    });
  }

  pageTag(): string {
    return publicStatusPageTag(this.slug() || 'loading');
  }

  loadPage(slug: string): void {
    this.isLoading.set(true);
    this.loadFailed.set(false);
    this.loadErrorKind.set(null);

    this.monitor
      .getStatusPageBySlug(slug)
      .pipe(timeout(15_000))
      .subscribe({
        next: page => {
          this.page.set(page);
          this.monitor.seedFromEmbeddedPage(page);
          this.ml.seedFromStatusPage(page);
          if (this.auth.isAuthenticated()) {
            this.monitor.fetchAllIncidents([page]);
            this.monitor.fetchAllServices([page]);
            runInInjectionContext(this.injector, () => {
              this.ml.fetchLatestStat(page.id);
              this.ml.fetchThreatReport(page.id);
              this.ml.fetchTemporalForecast(page.id);
            });
          }
          this.isLoading.set(false);
        },
        error: err => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 404) this.loadErrorKind.set('not_found');
            else if (err.status === 403) this.loadErrorKind.set('forbidden');
            else this.loadErrorKind.set('network');
          } else {
            this.loadErrorKind.set('network');
          }
          this.page.set(null);
          this.loadFailed.set(true);
          this.isLoading.set(false);
        },
      });
  }

  retryLoad(): void {
    this.isRetrying.set(true);
    const currentSlug = this.slug();
    if (currentSlug) this.loadPage(currentSlug);
  }

  private toServiceCard(
    page: StatusPageData,
    service: MonitoredServiceData,
  ): ExploreCardService {
    const uptime = service.sla ?? page.overall_uptime ?? page.cumulative_sla ?? null;
    const historySource = service.uptime_history?.length
      ? service.uptime_history
      : (page.uptime_history ?? []);
    return {
      id: service.id,
      name: formatServiceName(service.name),
      url: service.url,
      status: service.status || 'Operational',
      statusLabel: service.status || 'Operational',
      metrics: [
        {
          label: 'Response Time',
          value: formatLatencyMs(service.p99_latency ?? page.p99_latency),
          meta: 'Latest observation',
        },
        {
          label: 'Uptime',
          value: this.formatUptimePct(uptime),
          meta: '30-day SLA',
        },
      ],
      uptimeHistory: resolveUptimeHistory(historySource),
      uptimePercentage: uptime,
      uptimeSummary: uptime == null ? 'Awaiting probe history' : '30-day SLA',
    };
  }

  private formatUptimePct(value?: number | null): string {
    if (value === null || value === undefined) return '—';
    return `${value.toFixed(2)}%`;
  }

  private formatOptionalScore(value?: number | null): string {
    if (value === null || value === undefined) return '—';
    return value.toFixed(2);
  }

  private formatOptionalPercentRatio(value?: number | null): string {
    if (value === null || value === undefined) return '—';
    return `${(value * 100).toFixed(2)}%`;
  }
}
