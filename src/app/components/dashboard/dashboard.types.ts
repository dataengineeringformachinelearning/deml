/** Shared dashboard layout + accent tokens for reusable analytics cards. */
export type DashSize = 'sm' | 'md' | 'lg' | 'wide' | 'tall' | 'hero';

/** Maps to `--chart-series-1` | `3` | `4` via deml-ui `data-accent`. */
export type DashAccent = 'primary' | 'gold' | 'red';

/** Re-export chart scale so consumers can import from one dashboard module. */
export { CHART_SCALE, CHART_SERIES, DASH_ACCENT_SERIES } from './chart-scale';
export type { ChartScale } from './chart-scale';

export interface DashPoint {
  readonly label: string;
  readonly value: number;
}

export interface DashBarItem {
  readonly label: string;
  readonly value: number;
  /** Optional display value (e.g. "2.4k"); defaults to locale string of `value`. */
  readonly display?: string;
}

export interface DashMetricItem {
  readonly label: string;
  readonly value: string;
  readonly meta?: string;
}
