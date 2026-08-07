import { describe, expect, it } from 'vitest';

import type { StatusPageData } from '../../services/monitor.service';
import {
  exploreDetailMetricGroups,
  exploreDirectoryMetrics,
  formatLatencyMs,
} from './status-card-metrics';

const basePage = (overrides: Partial<StatusPageData> = {}): StatusPageData => ({
  id: 'p1',
  title: 'Platform Status',
  slug: 'platform-status',
  description: 'Live health',
  created_at: '2026-07-18T00:00:00Z',
  user_id: null,
  overall_uptime: 99.98,
  p99_latency: 42,
  spiking_temporal_forecast: 12,
  threat_anomaly_score: 0.004,
  uses_norse: true,
  ...overrides,
});

describe('status-card-metrics', () => {
  it('formats latency', () => {
    expect(formatLatencyMs(42)).toBe('42ms');
    expect(formatLatencyMs(1500)).toBe('1.50s');
    expect(formatLatencyMs(null)).toBe('—');
  });

  it('builds directory selling-point metrics', () => {
    const metrics = exploreDirectoryMetrics(basePage());
    expect(metrics.map((m) => m.label)).toEqual([
      'Cumulative SLA',
      'P99 Latency',
      'Spike Risk',
      'Threat Anomaly',
    ]);
    expect(metrics[0].value).toBe('99.98%');
    expect(metrics[1].value).toBe('42ms');
    expect(metrics[2].value).toBe('12.00');
    expect(metrics[3].value).toBe('0.40%');
    expect(metrics[3].meta).toBe('Active');
  });

  it('builds detail metric groups from embed fields', () => {
    const groups = exploreDetailMetricGroups(
      basePage({
        total_requests: 1200,
        predicted_sla: 99.5,
        threat_suspicious_ratio: 0.12,
      }),
    );
    expect(groups).toHaveLength(2);
    expect(groups[0].heading).toContain('Analytics');
    expect(groups[1].heading).toContain('intelligence');
    expect(groups[0].metrics.find((m) => m.label === 'Total Requests')?.value).toBe('1,200');
  });
});
