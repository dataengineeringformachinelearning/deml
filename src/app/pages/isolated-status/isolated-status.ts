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
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TimeoutError, lastValueFrom } from 'rxjs';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { Callout } from '../../components/callout/callout';
import { ErrorState } from '../../components/error-state/error-state';
import {
  ExploreCard,
  type ExploreCardIncident,
  type ExploreCardMetricGroup,
  type ExploreCardService,
  type ExploreCardStatus,
} from '../../components/explore-card/explore-card';
import { PageSection } from '../../components/page-section/page-section';
import { Skeleton } from '../../components/skeleton/skeleton';
import {
  OFFLINE_BODY,
  OFFLINE_HEADING,
  RETRY,
  STALE_STATUS,
} from '../../core/continuity-copy';
import { formatServiceName } from '../../core/utils/formatter.utils';
import {
  exploreDetailMetricGroups,
  exploreUptimeSummary,
  formatLatencyMs,
} from '../../core/utils/status-card-metrics';
import { compactUptimeHistory, resolveUptimeHistory } from '../../core/utils/uptime.utils';
import { AuthService } from '../../services/auth.service';
import { ConnectivityService } from '../../services/connectivity.service';
import {
  MonitorService,
  isPlatformStatusPage,
  type MonitoredServiceData,
  type StatusPageData,
} from '../../services/monitor.service';

/**
 * Public status detail — single SoT is the FORJD published slug payload
 * (services + incidents embedded). No authed enrichment (avoids wipe / races).
 */
@Component({
  selector: 'app-isolated-status',
  imports: [Banner, Button, Callout, ErrorState, ExploreCard, PageSection, Skeleton],
  templateUrl: './isolated-status.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsolatedStatus implements OnInit {
  private readonly monitor = inject(MonitorService);
  private readonly auth = inject(AuthService);
  private readonly connectivity = inject(ConnectivityService);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);

  private loadGeneration = 0;

  readonly slug = signal('');
  readonly page = signal<StatusPageData | null>(null);
  readonly loadFailed = signal(false);
  readonly loadErrorKind = signal<'network' | 'not_found' | 'forbidden' | null>(null);
  readonly isLoading = signal(true);
  readonly isRetrying = signal(false);
  readonly servingStale = this.monitor.slugServingStale;
  readonly online = this.connectivity.online;
  readonly offlineHeading = OFFLINE_HEADING;
  readonly offlineBody = OFFLINE_BODY;
  readonly staleStatus = STALE_STATUS;
  readonly retryLabel = RETRY;

  readonly globalStatus = computed((): ExploreCardStatus => {
    const current = this.page();
    if (!current) return 'unknown';
    const active = (current.incidents || []).filter(
      (incident) => incident.status !== 'Resolved',
    );
    const services = current.services || [];
    const overall = (current.overall_status || '').toLowerCase().replace(/[\s-]+/g, '_');
    if (services.length === 0 && active.length === 0) {
      if (overall === 'operational' || overall === 'up') return 'operational';
      if (overall.includes('degraded') || overall === 'partial_outage') return 'Degraded';
      if (overall.includes('maintenance')) return 'Maintenance';
      if (overall.includes('outage') || overall === 'down') return 'Outage';
      return 'unknown';
    }
    if (
      active.length > 0 ||
      services.some((service) => {
        const value = (service.status || '').toLowerCase();
        return value.includes('outage') || value === 'down';
      })
    ) {
      return 'Outage';
    }
    if (
      services.some((service) => {
        const value = (service.status || '').toLowerCase();
        return value.includes('degraded') || value.includes('partial');
      })
    ) {
      return 'Degraded';
    }
    if (
      services.some((service) => {
        const value = (service.status || '').toLowerCase();
        return value.includes('maintenance');
      })
    ) {
      return 'Maintenance';
    }
    if (
      services.every((service) => {
        const value = (service.status || 'unknown').toLowerCase();
        return value === 'unknown' || value === 'no_data' || !service.status;
      })
    ) {
      return 'unknown';
    }
    if (overall === 'operational' || overall === 'up') return 'operational';
    if (overall === 'unknown' || overall === 'no_data' || !overall) return 'unknown';
    // Explicit non-green overall already handled above; never invent Operational.
    return 'unknown';
  });

  readonly statusLabel = computed(() => {
    const status = `${this.globalStatus()}`.toLowerCase();
    if (status === 'operational' || status === 'up') return 'Operational';
    if (status.includes('degraded')) return 'Degraded';
    if (status.includes('maintenance')) return 'Maintenance';
    if (status.includes('outage') || status === 'down') return 'Outage';
    if (status === 'unknown' || status === 'no_data') return 'Unknown';
    return `${this.globalStatus()}`;
  });

  readonly pageTag = computed(() =>
    isPlatformStatusPage(this.page()) ? 'Platform Status' : 'Public Status Page',
  );

  readonly metricGroups = computed((): readonly ExploreCardMetricGroup[] => {
    const current = this.page();
    return current ? exploreDetailMetricGroups(current) : [];
  });

  readonly services = computed((): readonly ExploreCardService[] => {
    const current = this.page();
    if (!current) return [];
    return (current.services || []).map((service) => this.toServiceCard(current, service));
  });

  readonly incidents = computed((): readonly ExploreCardIncident[] => {
    const current = this.page();
    if (!current) return [];
    return (current.incidents || []).map(incident => ({
      id: incident.id || incident.title,
      title: incident.title,
      message: incident.message,
      status: incident.status,
      updatedAt: incident.updated_at || incident.created_at,
    }));
  });

  readonly uptimeHistory = computed(() => {
    const current = this.page();
    if (!current) {
      return [];
    }
    return compactUptimeHistory(resolveUptimeHistory(current.uptime_history), 21);
  });

  readonly uptimePercentage = computed(() => {
    const current = this.page();
    return current?.overall_uptime ?? current?.cumulative_sla ?? null;
  });

  readonly uptimeSummary = computed(() =>
    exploreUptimeSummary(this.statusLabel(), this.uptimePercentage()),
  );

  private lastReconnectGeneration = 0;

  constructor() {
    afterNextRender(() => {
      effect(
        () => {
          const currentSlug = this.slug();
          if (currentSlug && this.auth.isInitialized()) {
            void this.loadPage(currentSlug);
          }
        },
        { injector: this.injector },
      );
      effect(
        () => {
          const gen = this.connectivity.reconnectGeneration();
          const currentSlug = this.slug();
          if (
            gen > 0 &&
            gen !== this.lastReconnectGeneration &&
            currentSlug &&
            this.auth.isInitialized()
          ) {
            this.lastReconnectGeneration = gen;
            this.monitor.invalidateStatusReads();
            void this.loadPage(currentSlug);
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

  async loadPage(slug: string): Promise<void> {
    const generation = ++this.loadGeneration;
    this.isLoading.set(true);
    this.loadFailed.set(false);
    this.loadErrorKind.set(null);

    const peek = this.monitor.peekStatusPageBySlug(slug);
    if (peek) {
      this.page.set(peek);
      this.monitor.slugServingStale.set(true);
      this.isLoading.set(false);
    } else {
      this.monitor.slugServingStale.set(false);
    }

    try {
      // lastValueFrom waits for SWR revalidate; never treat warm cache as final.
      // Timeout budget lives on MonitorService + HTTP_TIMEOUT_MS (covers BFF retries).
      const page = await lastValueFrom(this.monitor.getStatusPageBySlug(slug));
      if (generation !== this.loadGeneration) return;
      if (!page || typeof page !== 'object' || !page.id) {
        throw new Error('invalid_slug_payload');
      }
      this.page.set(page);
      this.loadFailed.set(false);
    } catch (err: unknown) {
      if (generation !== this.loadGeneration) return;
      const warm = this.monitor.peekStatusPageBySlug(slug);
      if (warm) {
        // Honest stale: keep prior snapshot, never invent empty/partial as final.
        this.page.set(warm);
        this.monitor.slugServingStale.set(true);
        this.loadFailed.set(false);
        this.loadErrorKind.set(null);
        return;
      }
      if (err instanceof HttpErrorResponse) {
        if (err.status === 404) this.loadErrorKind.set('not_found');
        else if (err.status === 403) this.loadErrorKind.set('forbidden');
        else this.loadErrorKind.set('network');
      } else if (err instanceof TimeoutError) {
        this.loadErrorKind.set('network');
      } else {
        this.loadErrorKind.set('network');
      }
      this.page.set(null);
      this.loadFailed.set(true);
    } finally {
      if (generation === this.loadGeneration) {
        this.isLoading.set(false);
        this.isRetrying.set(false);
      }
    }
  }

  retryLoad(): void {
    this.isRetrying.set(true);
    const currentSlug = this.slug();
    if (currentSlug) void this.loadPage(currentSlug);
  }

  private toServiceCard(
    page: StatusPageData,
    service: MonitoredServiceData,
  ): ExploreCardService {
    const raw = (service.status || 'unknown').trim();
    const label =
      !raw || raw.toLowerCase() === 'unknown'
        ? 'Unknown'
        : raw.charAt(0).toUpperCase() + raw.slice(1).replace(/_/g, ' ');
    const uptime = service.sla ?? page.overall_uptime ?? page.cumulative_sla ?? null;
    const historySource = service.uptime_history?.length
      ? service.uptime_history
      : (page.uptime_history ?? []);
    return {
      id: service.id,
      name: formatServiceName(service.name),
      url: service.url,
      status: raw || 'unknown',
      statusLabel: label,
      metrics: [
        {
          label: 'Response Time',
          value: formatLatencyMs(service.p99_latency ?? page.p99_latency),
          meta: 'Latest observation',
        },
        {
          label: 'Uptime',
          value: uptime == null ? '—' : `${uptime.toFixed(2)}%`,
          meta: '30-day SLA',
        },
      ],
      uptimeHistory: compactUptimeHistory(resolveUptimeHistory(historySource), 14),
      uptimePercentage: uptime,
      uptimeSummary: uptime == null ? 'Awaiting probe history' : '30-day SLA',
    };
  }
}
