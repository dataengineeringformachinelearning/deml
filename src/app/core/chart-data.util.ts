import { DemlChartSeries, DemlTone } from '../shared/deml-chart/types';

export interface DemlDonutSegment {
  label: string;
  value: number;
  tone?: DemlTone;
}

const SEVERITY_TONES: Record<string, DemlTone> = {
  low: 'accent',
  medium: 'muted',
  high: 'warning',
  critical: 'danger',
};

export const severityToTone = (severity: string): DemlTone =>
  SEVERITY_TONES[severity.toLowerCase()] ?? 'muted';

export const toDemlLineSeries = (
  name: string,
  data: number[],
  tone: DemlTone = 'accent',
): DemlChartSeries[] => [{ name, data, tone }];

export const toDemlBarSeries = (
  name: string,
  data: number[],
  tone: DemlTone = 'accent',
): DemlChartSeries[] => [{ name, data, tone }];

export interface StatusCountRow {
  status?: string | number;
  code?: string | number;
  count: number;
}

export const toDemlStackedStatusSeries = (statuses: StatusCountRow[]): DemlChartSeries[] => {
  if (statuses.length === 0) {
    return [];
  }

  const toneByClass: Record<string, DemlTone> = {
    '2': 'success',
    '3': 'muted',
    '4': 'warning',
    '5': 'danger',
  };
  const classes = ['2', '3', '4', '5'];

  return classes.map(prefix => ({
    name: `${prefix}xx`,
    tone: toneByClass[prefix],
    data: statuses.map(row => {
      const code = String(row.status ?? row.code ?? '');
      return code.startsWith(prefix) ? (row.count ?? 0) : 0;
    }),
  }));
};

export const toDemlDonutSegments = (labels: string[], values: number[]): DemlDonutSegment[] =>
  labels.map((label, index) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value: values[index] ?? 0,
    tone: severityToTone(label),
  }));

export const hasChartValues = (data: number[]): boolean => data.some(value => value > 0);

export const hasDonutValues = (segments: DemlDonutSegment[]): boolean =>
  segments.some(segment => segment.value > 0);

/** Default bucket count for idle (loaded, zero) charts. */
export const IDLE_CHART_POINTS = 24;

/** Fixed hour labels for idle 24h charts after metrics load with no samples. */
export const idleHourCategories = (hours = IDLE_CHART_POINTS): string[] =>
  Array.from({ length: hours }, (_, index) => `${String(index).padStart(2, '0')}:00`);

/** Line/area series filled with zeros when telemetry has loaded but is empty. */
export const zeroBaselineLineSeries = (
  name: string,
  tone: DemlTone = 'accent',
  points = IDLE_CHART_POINTS,
): DemlChartSeries[] => toDemlLineSeries(name, Array.from({ length: points }, () => 0), tone);

/** Bar series filled with zeros when telemetry has loaded but is empty. */
export const zeroBaselineBarSeries = (
  name: string,
  tone: DemlTone = 'accent',
  points = IDLE_CHART_POINTS,
): DemlChartSeries[] => toDemlBarSeries(name, Array.from({ length: points }, () => 0), tone);

/** Prefer real series; otherwise a zero baseline so charts paint after load. */
export const withZeroBaselineSeries = (
  series: readonly DemlChartSeries[],
  fallbackName: string,
  tone: DemlTone = 'accent',
  points = IDLE_CHART_POINTS,
): DemlChartSeries[] => {
  const data = series[0]?.data ?? [];
  if (data.length > 0) {
    return [...series];
  }
  return zeroBaselineLineSeries(fallbackName, tone, points);
};

/** Prefer real bar series; otherwise a zero baseline. */
export const withZeroBaselineBarSeries = (
  series: readonly DemlChartSeries[],
  fallbackName: string,
  tone: DemlTone = 'accent',
  points = IDLE_CHART_POINTS,
): DemlChartSeries[] => {
  const data = series[0]?.data ?? [];
  if (data.length > 0) {
    return [...series];
  }
  return zeroBaselineBarSeries(fallbackName, tone, points);
};

/** Idle threat donut — all severities at 0 (chart paints a muted ring + 0). */
export const idleThreatDonutSegments = (): DemlDonutSegment[] =>
  toDemlDonutSegments(['low', 'medium', 'high', 'critical'], [0, 0, 0, 0]);

export const withIdleThreatDonut = (
  segments: readonly DemlDonutSegment[],
): DemlDonutSegment[] => (segments.length > 0 ? [...segments] : idleThreatDonutSegments());

export type MeasuredMetricPoint<T> = {
  point: T;
  value: number;
};

/** Keep only finite observations while retaining their labels/categories. */
export const measuredMetricPoints = <T>(
  points: readonly T[],
  readValue: (point: T) => number | null | undefined,
): MeasuredMetricPoint<T>[] =>
  points.flatMap(point => {
    const value = readValue(point);
    return typeof value === 'number' && Number.isFinite(value) ? [{ point, value }] : [];
  });

/** Build a single-series sparkline payload when enough points exist. */
export const toDemlSparklineSeries = (
  name: string,
  data: number[],
  tone: DemlTone = 'accent',
): DemlChartSeries[] => {
  if (data.length < 2) {
    return zeroBaselineLineSeries(name, tone, IDLE_CHART_POINTS);
  }
  return [{ name, data, tone }];
};
