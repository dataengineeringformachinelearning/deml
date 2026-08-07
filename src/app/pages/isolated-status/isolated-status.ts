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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TimeoutError, lastValueFrom, timeout } from 'rxjs';

import { Banner } from '../../components/banner/banner';
import { Button } from '../../components/button/button';
import {
  ExploreCard,
  type ExploreCardIncident,
  type ExploreCardService,
  type ExploreCardStatus,
} from '../../components/explore-card/explore-card';
import { PageSection } from '../../components/page-section/page-section';
import { OFFLINE_BODY, OFFLINE_HEADING } from '../../core/continuity-copy';
import { formatServiceName } from '../../core/utils/formatter.utils';
import { resolveUptimeHistory } from '../../core/utils/uptime.utils';
import { AuthService } from '../../services/auth.service';
import { ConnectivityService } from '../../services/connectivity.service';
import {
  MonitorService,
  type MonitoredServiceData,
  type StatusPageData,
} from '../../services/monitor.service';

/**
 * Public status detail — single SoT is the FORJD published slug payload
 * (services + incidents embedded). No authed enrichment (avoids wipe / races).
 */
@Component({
  selector: 'app-isolated-status',
  imports: [Banner, Button, ExploreCard, PageSection, RouterLink],
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

  readonly globalStatus = computed((): ExploreCardStatus => {
    const current = this.page();
    if (!current) return 'operational';
    const active = (current.incidents || []).filter(incident => incident.status !== 'Resolved');
    const services = current.services || [];
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

  readonly services = computed((): readonly ExploreCardService[] => {
    const current = this.page();
    if (!current) return [];
    return (current.services || []).map(service => this.toServiceCard(service));
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
    return current ? resolveUptimeHistory(current.uptime_history) : [];
  });

  readonly uptimePercentage = computed(() => {
    const current = this.page();
    return current?.overall_uptime ?? null;
  });

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
      const page = await lastValueFrom(
        this.monitor.getStatusPageBySlug(slug).pipe(timeout({ first: 25_000 })),
      );
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

  private toServiceCard(service: MonitoredServiceData): ExploreCardService {
    return {
      id: service.id,
      name: formatServiceName(service.name),
      url: service.url,
      status: service.status || 'Operational',
      statusLabel: service.status || 'Operational',
    };
  }
}
