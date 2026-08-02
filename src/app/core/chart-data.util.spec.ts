import { describe, expect, it } from 'vitest';

import {
  idleHourCategories,
  measuredMetricPoints,
  toDemlSparklineSeries,
  withIdleThreatDonut,
  withZeroBaselineBarSeries,
  withZeroBaselineSeries,
  zeroBaselineLineSeries,
} from './chart-data.util';

describe('measuredMetricPoints', () => {
  it('drops missing observations while keeping values aligned with their labels', () => {
    const measured = measuredMetricPoints(
      [
        { label: '10:00', latency: 0 },
        { label: '11:00', latency: null },
        { label: '12:00', latency: 12.5 },
        { label: '13:00', latency: Number.NaN },
      ],
      point => point.latency,
    );

    expect(measured.map(({ point }) => point.label)).toEqual(['10:00', '12:00']);
    expect(measured.map(({ value }) => value)).toEqual([0, 12.5]);
  });
});

describe('zero / idle chart baselines', () => {
  it('builds a 24-point zero line series for loaded-empty charts', () => {
    const series = zeroBaselineLineSeries('Latency (ms)');
    expect(series).toHaveLength(1);
    expect(series[0].data).toHaveLength(24);
    expect(series[0].data.every(value => value === 0)).toBe(true);
  });

  it('keeps real series when present', () => {
    const real = withZeroBaselineSeries([{ name: 'Latency (ms)', data: [1, 2, 3], tone: 'accent' }], 'Latency (ms)');
    expect(real[0].data).toEqual([1, 2, 3]);
  });

  it('falls back to a zero bar baseline when empty', () => {
    const series = withZeroBaselineBarSeries([], 'Anomalies', 'warning', 5);
    expect(series[0].data).toEqual([0, 0, 0, 0, 0]);
  });

  it('supplies idle threat donut segments when none exist', () => {
    const segments = withIdleThreatDonut([]);
    expect(segments.map(segment => segment.label)).toEqual([
      'Low',
      'Medium',
      'High',
      'Critical',
    ]);
    expect(segments.every(segment => segment.value === 0)).toBe(true);
  });

  it('keeps sparklines paintable for all-zero loaded series', () => {
    const spark = toDemlSparklineSeries('Uptime', [0, 0, 0, 0], 'success');
    expect(spark[0].data).toEqual([0, 0, 0, 0]);
  });

  it('emits hour categories for idle 24h charts', () => {
    expect(idleHourCategories(3)).toEqual(['00:00', '01:00', '02:00']);
  });
});
