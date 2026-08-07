import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  afterNextRender,
  effect,
  inject,
  signal,
} from '@angular/core';
import { lastValueFrom } from 'rxjs';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import {
  ExploreCard,
  type ExploreCardStatus,
} from '../../components/explore-card/explore-card';
import { PageSection } from '../../components/page-section/page-section';
import { OFFLINE_BODY, OFFLINE_HEADING } from '../../core/continuity-copy';
import { toUptimeHistoryDataPoints } from '../../core/utils/uptime.utils';
import { AuthService } from '../../services/auth.service';
import { ConnectivityService } from '../../services/connectivity.service';
import { MonitorService, type StatusPageData } from '../../services/monitor.service';
import type { UptimeHistoryDataPoint } from '../../shared/deml-chart/types';

/**
 * Explore directory — single SoT is FORJD published directory via BFF.
 * No per-slug hydrate and no authed enrichment (those race / wipe embedded truth).
 */
@Component({
  selector: 'app-explore',
  imports: [Banner, Button, ExploreCard, PageSection],
  templateUrl: './explore.html',
  host: { class: 'page page--catalog' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Explore implements OnInit {
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
    });
  }

  ngOnInit(): void {
    /* Directory loads after auth init. */
  }

  getPageUrl(page: StatusPageData): string {
    return `/status/${page.slug}`;
  }

  getPageStatus(page: StatusPageData): ExploreCardStatus {
    // Directory SoT embeds services/incidents when present — never enrichment maps.
    const active = (page.incidents || []).filter(incident => incident.status !== 'Resolved');
    if (active.length > 0) {
      return active[0].status as ExploreCardStatus;
    }
    const services = page.services || [];
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

  /** Single uptime field — FORJD overall_uptime is SoT (not cumulative_sla alias). */
  overallUptime(page: StatusPageData): number | null {
    return page.overall_uptime ?? null;
  }

  exploreUptimeHistory(page: StatusPageData): readonly UptimeHistoryDataPoint[] {
    const history = page.uptime_history ?? [];
    if (history.length > 0) {
      return toUptimeHistoryDataPoints(history);
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
