/** Shared dashboard layout + accent tokens for reusable analytics cards. */
export type DashSize = 'sm' | 'md' | 'lg' | 'wide' | 'tall' | 'hero';

export type DashAccent = 'primary' | 'gold' | 'red';

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
