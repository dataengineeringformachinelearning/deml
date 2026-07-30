import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  afterNextRender,
  PLATFORM_ID,
  effect,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  VikingCard,
  VikingChart,
  VikingButton,
  VikingBadge,
  VikingChartSeries,
  VikingGaugeArc,
  VikingPageHeader,
  VikingPageTemplate,
  VikingMetricRow,
  VikingMetricCard,
  VikingTabs,
  VikingTab,
  VikingTabPanel,
  VikingGridItem,
  VikingPanelGrid,
  VikingChartPanel,
  VikingChartCardHeader,
  VikingSection,
  VikingSpinner,
  VikingCallout,
  VikingPageSkeleton,
  VikingOnboardingChecklist,
  VikingStreamStatus,
  VikingSectionTemplate,
  VikingActivityList,
  VikingHudPanel,
  type VikingOnboardingStep,
  type SuiteActivityEntry,
} from '@dataengineeringformachinelearning/viking-ui';
import { ERROR_CODES } from '@dataengineeringformachinelearning/deml-contracts';
import {
  FORJD_FALLBACK_BODY,
  FORJD_UNAVAILABLE_BODY,
  FORJD_UPDATES_DELAYED_HEADING,
  LOAD_FAILED_BODY,
  OFFLINE_BODY,
  OFFLINE_HEADING,
  STATUS_RETRY_LABEL,
} from '../../core/continuity-copy';
import { streamStatusStory } from '../../core/stream-status';
import { VulnerabilityService, Vulnerability } from '../../services/vulnerability.service';
import { SettingsService } from '../../services/settings.service';
import { AuthService } from '../../services/auth.service';
import { MonitorService } from '../../services/monitor.service';
import { AnalyticsQueryService } from '../../services/analytics-query.service';
import { OnboardingService } from '../../services/onboarding.service';
import { LiveUpdatesService } from '../../services/live-updates.service';
import { ConnectivityService } from '../../services/connectivity.service';
import {
  UnifiedSelect,
  SelectOption,
} from '../../components/unified-select/unified-select.component';
import { VikingAppIcon } from '../../components/viking-app-icon/viking-app-icon';
import {
  VikingDonutSegment,
  measuredMetricPoints,
  toVikingBarSeries,
  toVikingDonutSegments,
  toVikingLineSeries,
  toVikingSparklineSeries,
  withIdleThreatDonut,
  withZeroBaselineBarSeries,
  withZeroBaselineSeries,
} from '../../core/chart-data.util';
import { formatLatencyMs } from '../../core/utils/formatter.utils';
import {
  type CesTelemetryPayload,
  formatCesPercent,
  formatCesScore,
  resolveCesTelemetry,
} from '../../core/ces-telemetry.util';

type DashboardTab = 'overview' | 'performance' | 'security';

type BenchmarkSummary = {
  score_percent: number | null;
  accuracy_percent: number | null;
  rmse: number | null;
  dataset_size: number;
  models_evaluated: number;
  evaluation_status: 'measured' | 'insufficient_data';
  created_at: string | null;
};

type AnalyticsTenant = {
  id: string;
  name: string;
  is_platform: boolean;
};

type TenantListResponse = {
  status: string;
  data?: AnalyticsTenant[];
};

type DashboardOverviewResponse = {
  status: string;
  degraded?: boolean;
  code?: string;
  data?: {
    benchmarking?: { current_scope?: BenchmarkSummary | null };
    ces?: CesTelemetryPayload & {
      threat?: number;
      spiking_temporal_forecast?: number;
    };
    user_metrics?: {
      p99_latency_ms?: number | null;
      uptime_percent?: number | null;
      total_requests_24h?: number;
      active_incidents?: number;
      unique_visitors?: number;
      available_sites?: string[];
      time_series?: { label?: string; time?: string; latency: number | null }[];
      uptime_series?: { label?: string; time?: string; uptime: number | null }[];
      threat_severity?: { severity: string; count: number }[];
      security_alerts?: { count: number }[];
    };
  };
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UnifiedSelect,
    VikingAppIcon,
    VikingCard,
    VikingChart,
    VikingButton,
    VikingBadge,
    VikingGaugeArc,
    VikingPageHeader,
    VikingPageTemplate,
    VikingMetricRow,
    VikingMetricCard,
    VikingTabs,
    VikingTab,
    VikingTabPanel,
    VikingGridItem,
    VikingPanelGrid,
    VikingChartPanel,
    VikingChartCardHeader,
    VikingSection,
    VikingSpinner,
    VikingPageSkeleton,
    VikingCallout,
    VikingOnboardingChecklist,
    VikingStreamStatus,
    VikingSectionTemplate,
    VikingActivityList,
    VikingHudPanel,
  ],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit, OnDestroy {
  protected readonly trackThreatById = (item: Vulnerability, _index: number): string => item.id;
  /** First-time status-page checklist (ADR-0025) — wizard remains the heavy path. */
  protected readonly onboardingSteps: readonly VikingOnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Open the setup wizard',
      description: 'Walk through naming a site, adding a health check, and publishing.',
    },
    {
      id: 'site',
      title: 'Name your status page',
      description: 'Create a slug your customers can bookmark.',
      routerLink: '/settings',
      actionLabel: 'Sites settings',
    },
    {
      id: 'endpoint',
      title: 'Add a health check',
      description: 'Monitor an HTTPS endpoint so uptime telemetry can populate.',
      routerLink: '/settings',
      actionLabel: 'Sites settings',
    },
    {
      id: 'publish',
      title: 'Publish when ready',
      description: 'Make the public status page live after checks look healthy.',
      routerLink: '/settings',
      actionLabel: 'Publish',
    },
  ];
  private readonly onboardingTick = signal(0);
  protected readonly showOnboardingGuide = computed(() => {
    this.onboardingTick();
    return this.onboardingService.shouldShowGuide();
  });
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  public vulnService = inject(VulnerabilityService);
  public settingsService = inject(SettingsService);
  public authService = inject(AuthService);
  private monitorService = inject(MonitorService);
  private analyticsQuery = inject(AnalyticsQueryService);
  private onboardingService = inject(OnboardingService);
  private liveUpdates = inject(LiveUpdatesService);
  readonly connectivity = inject(ConnectivityService);

  readonly offlineHeading = OFFLINE_HEADING;
  readonly offlineBody = OFFLINE_BODY;
  readonly retryLabel = STATUS_RETRY_LABEL;
  readonly updatesDelayedHeading = FORJD_UPDATES_DELAYED_HEADING;

  /** Calm near-real-time chip — never claims "Live". */
  readonly streamStatus = computed(() =>
    streamStatusStory({
      offline: this.connectivity.offline(),
      streamActive: this.liveUpdates.streamActive(),
      connected: this.liveUpdates.connected(),
      paused: this.liveUpdates.paused(),
      streamDegraded: this.liveUpdates.degraded(),
      metricsDegraded: this.metricsDegraded(),
    }),
  );

  activeTab = signal<DashboardTab>('overview');
  isLoading = signal(true);
  isRetrying = signal(false);
  /** True only after a successful overview payload is applied. */
  metricsReady = signal(false);
  /** Distinguishes FORJD outages from honest empty telemetry. */
  metricsDegraded = signal(false);
  loadError = signal<string | null>(null);

  latencySeries = signal<VikingChartSeries[]>(toVikingLineSeries('Latency (ms)', []));
  uptimeSeries = signal<VikingChartSeries[]>(toVikingLineSeries('Uptime (%)', [], 'success'));
  threatTrendSeries = signal<VikingChartSeries[]>(
    toVikingLineSeries('Threat events', [], 'warning'),
  );
  securityAlertSeries = signal<VikingChartSeries[]>(toVikingBarSeries('Anomalies', [], 'warning'));
  threatDonutSegments = signal<VikingDonutSegment[]>([]);

  // --- Analytics metrics (signal-owned for zoneless / OnPush) ---
  threatLevel = signal(0);
  cesLevel = signal<number | null>(null);
  stabilityLevel = signal<number | null>(null);
  slaLevel = signal<number | null>(null);
  p99Latency = signal<number | null>(null);
  uptimePercent = signal<number | null>(null);
  totalRequests = signal(0);
  activeIncidents = signal(0);
  uniqueVisitors = signal(0);
  benchmarkSummary = signal<BenchmarkSummary | null>(null);
  protected readonly formatLatencyMs = formatLatencyMs;
  protected readonly formatCesPercent = formatCesPercent;
  protected readonly formatCesScore = formatCesScore;

  selectedTenantId = signal<string | null>(null);
  selectedSite = signal<string | null>(null);
  tenantOptions = signal<SelectOption[]>([]);
  siteOptions = signal<SelectOption[]>([{ value: 'All', label: 'All Sites' }]);

  private intervalId: ReturnType<typeof setInterval> | undefined;
  private liveRefreshTimer: ReturnType<typeof setTimeout> | undefined;
  private unsubOnboarding: (() => void) | undefined;
  private readonly queryParams = toSignal(this.route.queryParamMap, {
    requireSync: true,
  });

  openVulnCount = computed(
    () =>
      this.vulnService
        .vulnerabilities()
        .filter(v => v.status !== 'Resolved' && v.status !== 'False Positive').length,
  );

  criticalVulnCount = computed(
    () =>
      this.vulnService
        .vulnerabilities()
        .filter(v => v.severity === 'Critical' && v.status !== 'Resolved').length,
  );

  recentThreats = computed(() =>
    this.vulnService
      .vulnerabilities()
      .filter(v => v.status !== 'Resolved' && v.status !== 'False Positive')
      .slice(0, 6),
  );

  /** Ops list ladder: title → severity/status → timestamp (never flat pills-first). */
  recentThreatEntries = computed<readonly SuiteActivityEntry[]>(() =>
    this.recentThreats().map(v => ({
      id: v.id,
      at: Date.parse(v.updated_at || v.created_at) || Date.now(),
      kind: 'threat',
      label: v.title,
      detail: `${v.severity} · ${v.status}`,
      source: 'deml' as const,
    })),
  );

  threatQueueEntries = computed<readonly SuiteActivityEntry[]>(() =>
    this.vulnService
      .vulnerabilities()
      .slice(0, 25)
      .map(v => ({
        id: v.id,
        at: Date.parse(v.updated_at || v.created_at) || Date.now(),
        kind: 'threat',
        label: v.title,
        detail: `${v.severity} · ${v.status}${v.customer_id ? ` · ${v.customer_id}` : ''}`,
        source: 'deml' as const,
      })),
  );

  healthScore = computed(() => {
    const stability = this.stabilityLevel();
    if (!this.metricsReady() || this.metricsDegraded() || stability === null) return null;
    const threatPenalty = Math.min(this.threatLevel(), 100) * 0.35;
    const stabilityBonus = Math.min(stability, 100) * 0.35;
    const vulnPenalty = Math.min(this.openVulnCount() * 8, 30);
    return Math.round(
      Math.max(0, Math.min(100, stabilityBonus + (100 - threatPenalty) * 0.3 - vulnPenalty + 15)),
    );
  });

  healthLabel = computed(() => {
    const score = this.healthScore();
    if (score === null) return '—';
    if (score >= 85) return 'Healthy';
    if (score >= 65) return 'Watch';
    if (score >= 40) return 'At Risk';
    return 'Critical';
  });

  healthGaugeTone = computed<'amber' | 'danger' | 'info' | 'success'>(() => {
    const label = this.healthLabel();
    if (label === '—') return 'info';
    if (label === 'At Risk') return 'amber';
    if (label === 'Critical') return 'danger';
    if (label === 'Watch') return 'info';
    return 'success';
  });

  // Fourth model: Spiking Temporal Forecast (from backend overview telemetry)
  temporalForecast = signal<number>(0);

  myPages = computed(() => {
    const uid = this.authService.currentUserId();
    return this.settingsService
      .statusPages()
      .filter(p => p.user_id === uid && p.slug !== 'platform-status');
  });

  setupComplete = computed(() => this.myPages().length > 0);

  /** Charts always paint after load — zero baseline when telemetry is empty. */
  displayLatencySeries = computed(() =>
    withZeroBaselineSeries(this.latencySeries(), 'Latency (ms)'),
  );

  displayUptimeSeries = computed(() =>
    withZeroBaselineSeries(this.uptimeSeries(), 'Uptime (%)', 'success'),
  );

  displaySecurityAlertSeries = computed(() =>
    withZeroBaselineBarSeries(this.securityAlertSeries(), 'Anomalies', 'warning'),
  );

  displayThreatDonutSegments = computed(() => withIdleThreatDonut(this.threatDonutSegments()));

  anomalyCountLabel = computed(() => {
    const total = this.securityAlertSeries().flatMap(series => series.data).reduce((sum, n) => sum + n, 0);
    return String(total);
  });

  uptimeSparkline = computed(() =>
    toVikingSparklineSeries('Uptime', this.displayUptimeSeries()[0]?.data ?? [], 'success'),
  );

  threatSparkline = computed(() =>
    toVikingSparklineSeries(
      'Threats',
      withZeroBaselineSeries(this.threatTrendSeries(), 'Threat events', 'warning')[0]?.data ?? [],
      'warning',
    ),
  );

  constructor() {
    effect(() => {
      const params = this.queryParams();
      const tab = params.get('tab') as DashboardTab | null;
      if (tab === 'performance' || tab === 'security' || tab === 'overview') {
        this.activeTab.set(tab);
      }
      if (params.get('setup') === '1' && this.isBrowser) {
        setTimeout(() => this.openOnboardingWizard(), 300);
      }
    });

    effect(() => {
      const evt = this.liveUpdates.latestEvent();
      if (evt?.type === 'projections') this.scheduleLiveRefresh();
    });

    // Typed SSE degraded frame from Django→FORJD cursor bridge.
    effect(() => {
      if (!this.liveUpdates.degraded()) return;
      this.metricsDegraded.set(true);
      this.loadError.set(FORJD_FALLBACK_BODY);
    });

    // Optimistic: seed from SWR so revisits paint KPIs before network returns.
    this.seedFromCache();

    afterNextRender(() => {
      if (this.isBrowser) {
        this.loadTenants();
        this.loadUserPages();
        this.intervalId = setInterval(() => this.refreshData(), 60000);
        this.liveUpdates.start();
      }
    });
  }

  private seedFromCache(): void {
    const tenants = this.analyticsQuery.peekTenants<TenantListResponse>();
    if (tenants?.status === 'success' && tenants.data?.length) {
      this.tenantOptions.set(
        tenants.data.map(tenant => ({
          value: tenant.id,
          label: tenant.is_platform ? `${tenant.name} (Global)` : tenant.name,
        })),
      );
      if (!this.selectedTenantId()) {
        const userTenant = tenants.data.find(tenant => !tenant.is_platform);
        this.selectedTenantId.set(userTenant ? userTenant.id : tenants.data[0].id);
      }
    }
    const overview = this.analyticsQuery.peekOverview<DashboardOverviewResponse>(
      this.selectedTenantId(),
      this.selectedSite(),
    );
    if (overview) {
      this.applyOverviewResponse(overview);
    }
  }

  ngOnInit() {
    this.titleService.setTitle('Dashboard - DEML');
    this.metaService.updateTag({
      name: 'description',
      content: 'Unified security and performance dashboard for your monitored sites.',
    });
    this.unsubOnboarding = this.onboardingService.subscribe(() => {
      this.onboardingTick.update(n => n + 1);
    });
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.liveRefreshTimer) clearTimeout(this.liveRefreshTimer);
    this.unsubOnboarding?.();
    this.liveUpdates.stop();
  }

  /** Debounce live change ticks so bursts collapse into one reload. */
  private scheduleLiveRefresh() {
    if (this.liveRefreshTimer) return;
    this.liveRefreshTimer = setTimeout(() => {
      this.liveRefreshTimer = undefined;
      // A projection tick means the cached overview is no longer fresh.
      // Invalidate before reloading so the Updating state corresponds to
      // newly projected telemetry instead of a 15-second SWR cache hit.
      this.analyticsQuery.invalidateOverview(this.selectedTenantId());
      this.refreshData();
    }, 2000);
  }

  setTab(tab: string) {
    if (tab !== 'overview' && tab !== 'performance' && tab !== 'security') return;
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  openOnboardingWizard() {
    this.onboardingService.completeStep('welcome');
    void this.onboardingService.openWizard()?.then(() => {
      this.loadUserPages(false);
    });
  }

  private loadUserPages(autoOpenWizard = true) {
    this.monitorService.getStatusPages().subscribe({
      next: data => {
        if (Array.isArray(data)) {
          const uid = this.authService.currentUserId();
          const myPages = data.filter(p => p.user_id === uid && p.slug !== 'platform-status');
          this.settingsService.statusPages.set(myPages);
          if (autoOpenWizard && this.onboardingService.shouldAutoOpen(myPages.length > 0)) {
            setTimeout(() => this.openOnboardingWizard(), 400);
          }
        }
      },
      error: () => {
        // Keep dashboard usable when the pages directory is unreachable.
      },
    });
  }

  retryLoad() {
    this.isRetrying.set(true);
    this.refreshData();
  }

  private refreshData() {
    this.loadAnalyticsData();
    this.vulnService.fetchVulnerabilities(
      this.selectedTenantId() || undefined,
      this.selectedSite() || undefined,
    );
  }

  private loadTenants() {
    this.analyticsQuery.getTenants<TenantListResponse>().subscribe({
      next: response => {
        if (response.status === 'success' && response.data) {
          const tenants = response.data;
          this.tenantOptions.set(
            tenants.map(tenant => ({
              value: tenant.id,
              label: tenant.is_platform ? `${tenant.name} (Global)` : tenant.name,
            })),
          );
          if (!this.selectedTenantId() && tenants.length > 0) {
            const userTenant = tenants.find(tenant => !tenant.is_platform);
            this.selectedTenantId.set(userTenant ? userTenant.id : tenants[0].id);
          }
        }
        this.loadAnalyticsData();
        this.vulnService.fetchVulnerabilities(
          this.selectedTenantId() || undefined,
          this.selectedSite() || undefined,
        );
        this.vulnService.fetchIncidents(this.selectedTenantId() || undefined);
      },
      error: () => {
        this.loadAnalyticsData();
        this.isLoading.set(false);
      },
    });
  }

  private applyOverviewResponse(response: DashboardOverviewResponse): void {
    if (response.status === 'success' && response.data) {
      const degraded =
        response?.degraded === true || response?.code === ERROR_CODES.FORJD_DEGRADED;
      const { benchmarking, ces, user_metrics } = response.data;
      const resolvedCes = resolveCesTelemetry(ces, degraded);
      this.cesLevel.set(resolvedCes.level);
      this.threatLevel.set(ces?.threat ?? 0);
      this.slaLevel.set(resolvedCes.sla);
      this.stabilityLevel.set(resolvedCes.stability);
      this.temporalForecast.set(ces?.spiking_temporal_forecast ?? 0);
      this.p99Latency.set(user_metrics?.p99_latency_ms ?? null);
      this.uptimePercent.set(user_metrics?.uptime_percent ?? null);
      this.totalRequests.set(user_metrics?.total_requests_24h ?? 0);
      this.activeIncidents.set(user_metrics?.active_incidents ?? 0);
      this.uniqueVisitors.set(user_metrics?.unique_visitors ?? 0);
      this.benchmarkSummary.set(benchmarking?.current_scope ?? null);
      this.metricsReady.set(!degraded);
      this.metricsDegraded.set(degraded);
      this.loadError.set(degraded ? FORJD_FALLBACK_BODY : null);

      if (user_metrics?.available_sites) {
        this.siteOptions.set([
          { value: 'All', label: 'All Sites' },
          ...user_metrics.available_sites.map((s: string) => ({ value: s, label: s })),
        ]);
      }

      const timeSeries = user_metrics?.time_series || [];
      const measuredLatency = measuredMetricPoints(timeSeries, point => point.latency);
      this.latencySeries.set(
        toVikingLineSeries(
          'Latency (ms)',
          measuredLatency.map(({ value }) => value),
        ),
      );

      const uptimeSeriesData = user_metrics?.uptime_series || [];
      const measuredUptime = measuredMetricPoints(uptimeSeriesData, point => point.uptime);
      this.uptimeSeries.set(
        toVikingLineSeries(
          'Uptime (%)',
          measuredUptime.map(({ value }) => value),
          'success',
        ),
      );

      const threats = user_metrics?.threat_severity || [];
      this.threatDonutSegments.set(
        toVikingDonutSegments(
          threats.map((d: { severity: string }) => d.severity),
          threats.map((d: { count: number }) => d.count ?? 0),
        ),
      );

      const alerts = user_metrics?.security_alerts || [];
      this.threatTrendSeries.set(
        toVikingLineSeries(
          'Threat events',
          alerts.map((d: { count: number }) => d.count ?? 0),
          'warning',
        ),
      );
      this.securityAlertSeries.set(
        toVikingBarSeries(
          'Anomalies',
          alerts.map((d: { count: number }) => d.count ?? 0),
          'warning',
        ),
      );
    }
    this.isLoading.set(false);
    this.isRetrying.set(false);
  }

  private loadAnalyticsData() {
    const tenantId = this.selectedTenantId();
    const site = this.selectedSite();
    // Keep prior KPIs visible while SWR revalidates.
    if (!this.metricsReady()) {
      this.isLoading.set(true);
    }
    this.loadError.set(null);

    this.analyticsQuery.getOverview<DashboardOverviewResponse>(tenantId, site).subscribe({
      next: response => {
        this.applyOverviewResponse(response);
      },
      error: (err: { status?: number; error?: { detail?: string; code?: string } }) => {
        this.metricsReady.set(false);
        this.metricsDegraded.set(true);
        const code = err?.error?.code;
        const detail = err?.error?.detail;
        if (err?.status === 503 || code === ERROR_CODES.FORJD_DEGRADED) {
          this.loadError.set(detail || FORJD_UNAVAILABLE_BODY);
        } else {
          this.loadError.set(detail || LOAD_FAILED_BODY);
        }
        this.isLoading.set(false);
        this.isRetrying.set(false);
      },
    });
  }

  onTenantChange(tenantId: string) {
    this.selectedTenantId.set(tenantId);
    this.selectedSite.set('All');
    this.refreshData();
  }

  onSiteChange(site: string) {
    this.selectedSite.set(site);
    this.refreshData();
  }

  getGaugeStroke(value: number, circumference: number): string {
    const dash = (value / 100) * circumference;
    return `${dash} ${circumference}`;
  }

  benchmarkScoreLabel(): string {
    const score = this.benchmarkSummary()?.score_percent;
    return score === null || score === undefined ? '—' : `${score.toFixed(0)}%`;
  }

  benchmarkSampleLabel(): string {
    return (this.benchmarkSummary()?.dataset_size ?? 0).toLocaleString();
  }

  benchmarkSublabel(): string {
    const samples = this.benchmarkSummary()?.dataset_size ?? 0;
    return samples > 0
      ? `${samples.toLocaleString()} validation samples`
      : 'Runs with daily model training';
  }

  severityClass(severity: string): string {
    return severity.toLowerCase();
  }

  trackThreat(_index: number, threat: Vulnerability): string {
    return threat.id;
  }
}
