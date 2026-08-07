import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  afterNextRender,
  effect,
  inject,
  signal,
} from '@angular/core';
import { lastValueFrom } from 'rxjs';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import { Callout } from '../../components/callout/callout';
import { EmptyState } from '../../components/empty-state/empty-state';
import { ErrorState } from '../../components/error-state/error-state';
import {
  ExploreCard,
  type ExploreCardMetric,
  type ExploreCardStatus,
} from '../../components/explore-card/explore-card';
import { PageSection } from '../../components/page-section/page-section';
import { Skeleton } from '../../components/skeleton/skeleton';
import {
  OFFLINE_BODY,
  OFFLINE_HEADING,
  RETRY,
  STALE_DIRECTORY,
} from '../../core/continuity-copy';
import {
  exploreDirectoryMetrics,
  exploreUptimeSummary,
} from '../../core/utils/status-card-metrics';
import {
  compactUptimeHistory,
  toUptimeHistoryDataPoints,
  type UptimeHistoryDataPoint,
} from '../../core/utils/uptime.utils';
import { AuthService } from '../../services/auth.service';
import { ConnectivityService } from '../../services/connectivity.service';
import {
  MonitorService,
  isPlatformStatusPage,
  type StatusPageData,
} from '../../services/monitor.service';

/**
 * Explore directory — single SoT is FORJD published directory via BFF.
 * No per-slug hydrate and no authed enrichment (those race / wipe embedded truth).
 */
@Component({
  selector: 'app-explore',
  imports: [Banner, Button, Callout, EmptyState, ErrorState, ExploreCard, PageSection, Skeleton],
  templateUrl: './explore.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Explore {
  private readonly monitor = inject(MonitorService);
  private readonly auth = inject(AuthService);
  private readonly connectivity = inject(ConnectivityService);
  private readonly injector = inject(Injector);

  /** Monotonic load generation — drop stale async completions. */
  private loadGeneration = 0;

  readonly statusPages = signal<StatusPageData[]>([]);
  readonly loadFailed = signal(false);
  readonly isLoading = signal(true);
  readonly isRetrying = signal(false);
  readonly servingStale = this.monitor.directoryServingStale;
  readonly online = this.connectivity.online;
  readonly offlineHeading = OFFLINE_HEADING;
  readonly offlineBody = OFFLINE_BODY;
  readonly staleDirectory = STALE_DIRECTORY;
  readonly retryLabel = RETRY;

  private lastReconnectGeneration = 0;

  constructor() {
    afterNextRender(() => {
      effect(
        () => {
          if (this.auth.isInitialized()) {
            void this.loadData();
          }
        },
        { injector: this.injector },
      );
      effect(
        () => {
          const gen = this.connectivity.reconnectGeneration();
          if (gen > 0 && gen !== this.lastReconnectGeneration && this.auth.isInitialized()) {
            this.lastReconnectGeneration = gen;
            this.monitor.invalidateStatusReads();
            void this.loadData();
          }
        },
        { injector: this.injector },
      );
    });
  }

  getPageUrl(page: StatusPageData): string {
    return `/status/${page.slug}`;
  }

  getPageStatus(page: StatusPageData): ExploreCardStatus {
    // Directory SoT: prefer embedded services/incidents; else trust overall_status
    // from FORJD (directory omits service arrays by design).
    const active = (page.incidents || []).filter((incident) => incident.status !== 'Resolved');
    if (active.length > 0) {
      return active[0].status as ExploreCardStatus;
    }
    const mapOverall = (raw: string): ExploreCardStatus | null => {
      const overall = raw.toLowerCase().replace(/[\s-]+/g, '_');
      if (!overall || overall === 'unknown' || overall === 'no_data') return 'unknown';
      if (overall === 'operational' || overall === 'up') return 'operational';
      if (overall.includes('degraded') || overall === 'partial_outage') return 'Degraded';
      if (overall.includes('maintenance')) return 'Maintenance';
      if (overall.includes('outage') || overall === 'down') return 'Outage';
      return null;
    };
    const services = page.services || [];
    if (services.length === 0) {
      return mapOverall(page.overall_status || '') ?? 'unknown';
    }
    const normalized = (status?: string | null) =>
      (status || 'unknown').toLowerCase().replace(/[\s-]+/g, '_');
    if (
      services.some((service) => {
        const value = normalized(service.status);
        return value === 'outage' || value === 'major_outage' || value === 'down';
      })
    ) {
      return 'Outage';
    }
    if (
      services.some((service) => {
        const value = normalized(service.status);
        return value === 'degraded' || value === 'partial_outage' || value === 'partial';
      })
    ) {
      return 'Degraded';
    }
    if (services.some((service) => normalized(service.status) === 'maintenance')) {
      return 'Maintenance';
    }
    if (services.every((service) => normalized(service.status) === 'unknown')) {
      return 'unknown';
    }
    return mapOverall(page.overall_status || '') ?? 'unknown';
  }

  getPageStatusLabel(page: StatusPageData): string {
    const status = `${this.getPageStatus(page)}`.toLowerCase();
    if (status === 'operational' || status === 'up') return 'Operational';
    if (status === 'degraded' || status === 'partial outage') return 'Degraded';
    if (status === 'maintenance') return 'Maintenance';
    if (status === 'outage' || status === 'major outage' || status === 'down') return 'Outage';
    if (status === 'unknown' || status === 'no_data') return 'Unknown';
    return `${this.getPageStatus(page)}`;
  }

  /** Single uptime field — FORJD overall_uptime is SoT. */
  overallUptime(page: StatusPageData): number | null {
    return page.overall_uptime ?? page.cumulative_sla ?? null;
  }

  pageTag(page: StatusPageData): string {
    return isPlatformStatusPage(page) ? 'Platform Status' : 'Public Status Page';
  }

  exploreMetrics(page: StatusPageData): readonly ExploreCardMetric[] {
    return exploreDirectoryMetrics(page);
  }

  uptimeSummaryFor(page: StatusPageData): string {
    return exploreUptimeSummary(this.getPageStatusLabel(page), this.overallUptime(page));
  }

  exploreUptimeHistory(page: StatusPageData): readonly UptimeHistoryDataPoint[] {
    const history = page.uptime_history ?? [];
    if (history.length > 0) {
      return compactUptimeHistory(toUptimeHistoryDataPoints(history), 14);
    }
    return [];
  }

  async loadData(): Promise<void> {
    const generation = ++this.loadGeneration;
    this.isLoading.set(true);
    this.loadFailed.set(false);

    const peek = this.monitor.peekStatusPages();
    if (Array.isArray(peek) && peek.length > 0) {
      // Peek is provisional — mark stale until revalidate settles.
      this.statusPages.set(this.publicPages(peek));
      this.monitor.directoryServingStale.set(true);
      this.isLoading.set(false);
    }

    try {
      // lastValueFrom waits for SWR revalidate so we never treat warm cache as final.
      const data = await lastValueFrom(this.monitor.getStatusPages());
      if (generation !== this.loadGeneration) return;
      if (!Array.isArray(data)) {
        throw new Error('invalid_directory_payload');
      }
      this.statusPages.set(this.publicPages(data));
      this.loadFailed.set(false);
    } catch {
      if (generation !== this.loadGeneration) return;
      const warm = this.monitor.peekStatusPages();
      if (Array.isArray(warm) && warm.length > 0) {
        this.statusPages.set(this.publicPages(warm));
        this.monitor.directoryServingStale.set(true);
        this.loadFailed.set(false);
      } else {
        this.statusPages.set([]);
        this.loadFailed.set(true);
      }
    } finally {
      if (generation === this.loadGeneration) {
        this.isLoading.set(false);
        this.isRetrying.set(false);
      }
    }
  }

  retryLoad(): void {
    this.isRetrying.set(true);
    void this.loadData();
  }

  private publicPages(data: StatusPageData[]): StatusPageData[] {
    return data.filter(p => p.is_published || p.slug === 'platform-status');
  }
}
