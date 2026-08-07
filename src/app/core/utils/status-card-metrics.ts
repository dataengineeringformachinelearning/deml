import type {
  ExploreCardMetric,
  ExploreCardMetricGroup,
} from '../../components/explore-card/explore-card';
import type { StatusPageData } from '../../services/monitor.service';

/** Latency display for explore/status cards. */
export const formatLatencyMs = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}s`;
  }
  return `${Math.round(value)}ms`;
};

const formatUptimePct = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return `${value.toFixed(2)}%`;
};

const formatOptionalScore = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return value.toFixed(2);
};

const formatOptionalPercentRatio = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return `${(value * 100).toFixed(2)}%`;
};

const norseLabel = (page: StatusPageData): string => {
  if (page.uses_norse === true) return 'Active';
  if (page.uses_norse === false) return 'MLP Fallback';
  const status = (page.temporal_status || '').toLowerCase();
  if (status === 'ready') return 'Active';
  if (status === 'insufficient_data') return 'Collecting';
  return 'Pending';
};

/**
 * Directory mega-card stats — the signup selling point.
 * Sourced from FORJD public embed via BFF (no separate ML fetch).
 */
export const exploreDirectoryMetrics = (
  page: StatusPageData,
): readonly ExploreCardMetric[] => {
  const sla = page.overall_uptime ?? page.cumulative_sla ?? null;
  return [
    {
      label: 'Cumulative SLA',
      value: formatUptimePct(sla),
      meta: 'Based on real telemetry',
    },
    {
      label: 'P99 Latency',
      value: formatLatencyMs(page.p99_latency),
      meta: 'Last 24h',
    },
    {
      label: 'Spike Risk',
      value: formatOptionalScore(page.spiking_temporal_forecast),
      meta: 'Dynamic Temporal Forecasting',
    },
    {
      label: 'Threat Anomaly',
      value: formatOptionalPercentRatio(page.threat_anomaly_score),
      meta: norseLabel(page),
    },
  ];
};

/** Detail mega-card grouped stats (analytics + intelligence). */
export const exploreDetailMetricGroups = (
  page: StatusPageData,
): readonly ExploreCardMetricGroup[] => [
  {
    id: 'analytics',
    heading: 'Analytics & service level',
    metrics: [
      {
        label: 'P99 Latency',
        value: formatLatencyMs(page.p99_latency),
        meta: 'Last 24 hours',
      },
      {
        label: 'Total Requests',
        value:
          page.total_requests == null
            ? '—'
            : new Intl.NumberFormat('en-US').format(page.total_requests),
        meta: 'Last 24 hours',
      },
      {
        label: 'Cumulative SLA',
        value: formatUptimePct(page.overall_uptime ?? page.cumulative_sla),
        meta: 'Based on real telemetry',
      },
      {
        label: 'Predicted SLA',
        value: formatUptimePct(page.predicted_sla),
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
        value: norseLabel(page),
        meta: 'Temporal inference engine',
      },
      {
        label: 'Spike Risk',
        value: formatOptionalScore(page.spiking_temporal_forecast),
        meta: 'Telemetry sequence score',
      },
      {
        label: 'Cumulative TA',
        value: formatOptionalPercentRatio(page.threat_suspicious_ratio),
        meta: 'Based on real telemetry',
      },
      {
        label: 'Predicted TA',
        value: formatOptionalPercentRatio(page.threat_anomaly_score),
        meta: '30-day threat forecast',
      },
    ],
  },
];

export const exploreUptimeSummary = (
  statusLabel: string,
  uptime: number | null | undefined,
): string => {
  if (uptime == null) return 'Awaiting probe history';
  return statusLabel === 'Operational' ? 'No current issues' : statusLabel;
};
