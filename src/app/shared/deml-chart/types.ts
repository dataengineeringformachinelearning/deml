/**
 * Semantic tones for chart helpers — map to deml-ui series tokens only.
 * `--chart-series-1` primary blue · `2` gray · `3` green · `4` red
 */
export type DemlTone =
  | 'accent'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'muted';

/** Tone → deml-ui series CSS custom property (palette only). */
export const DEML_TONE_SERIES: Record<DemlTone, string> = {
  accent: 'var(--chart-series-1)',
  primary: 'var(--chart-series-1)',
  success: 'var(--chart-series-3)',
  warning: 'var(--chart-series-4)',
  danger: 'var(--chart-series-4)',
  neutral: 'var(--chart-series-2)',
  muted: 'var(--chart-series-2)',
};

export interface DemlChartSeries {
  name: string;
  data: number[];
  tone?: DemlTone;
}

export interface DemlDonutSegment {
  label: string;
  value: number;
  tone?: DemlTone;
}

export type UptimeHistoryStatus = 'up' | 'partial' | 'down' | 'no_data';

export type UptimeHistoryDataPoint = {
  date: string;
  status: UptimeHistoryStatus;
  uptime?: number;
};
