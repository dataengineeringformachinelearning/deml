import type {
  DashAccent,
  DashBarItem,
  DashMetricItem,
  DashPoint,
  DashSize,
} from '../components/dashboard/dashboard.types';

/** Demo analytics for the dashboard — shaped for reusable chart components. */
export const DASH_LISTENERS_WEEK: readonly DashPoint[] = [
  { label: 'Mon', value: 420 },
  { label: 'Tue', value: 510 },
  { label: 'Wed', value: 480 },
  { label: 'Thu', value: 640 },
  { label: 'Fri', value: 720 },
  { label: 'Sat', value: 890 },
  { label: 'Sun', value: 760 },
];

export const DASH_SESSIONS_MONTH: readonly DashPoint[] = [
  { label: 'W1', value: 1200 },
  { label: 'W2', value: 1560 },
  { label: 'W3', value: 1420 },
  { label: 'W4', value: 1880 },
  { label: 'W5', value: 2100 },
  { label: 'W6', value: 1980 },
  { label: 'W7', value: 2340 },
  { label: 'W8', value: 2510 },
];

export const DASH_ENGAGEMENT_SPARK: readonly DashPoint[] = [
  { label: '1', value: 32 },
  { label: '2', value: 40 },
  { label: '3', value: 38 },
  { label: '4', value: 52 },
  { label: '5', value: 61 },
  { label: '6', value: 58 },
  { label: '7', value: 70 },
];

export const DASH_RETENTION_SPARK: readonly DashPoint[] = [
  { label: '1', value: 78 },
  { label: '2', value: 74 },
  { label: '3', value: 76 },
  { label: '4', value: 71 },
  { label: '5', value: 69 },
  { label: '6', value: 73 },
  { label: '7', value: 75 },
];

export const DASH_TOP_CHANNELS: readonly DashBarItem[] = [
  { label: 'Direct', value: 4280, display: '4.3k' },
  { label: 'Search', value: 3120, display: '3.1k' },
  { label: 'Referral', value: 1840, display: '1.8k' },
  { label: 'Social', value: 1260, display: '1.3k' },
  { label: 'Email', value: 940, display: '940' },
];

export const DASH_TOP_CONTENT: readonly DashMetricItem[] = [
  { label: 'Build with clarity', meta: 'Blog · 12 min', value: '8.4k' },
  { label: 'fastapi', meta: 'Learn · Package', value: '6.1k' },
  { label: 'Quiet interfaces', meta: 'Blog · 8 min', value: '4.9k' },
  { label: 'angular', meta: 'Learn · Package', value: '3.7k' },
  { label: 'Shipping sites', meta: 'Blog · 6 min', value: '2.8k' },
];

export const DASH_DEVICE_MIX: readonly DashBarItem[] = [
  { label: 'Mobile', value: 58, display: '58%' },
  { label: 'Desktop', value: 34, display: '34%' },
  { label: 'Tablet', value: 8, display: '8%' },
];

export interface DashStatTile {
  readonly kind: 'stat';
  readonly id: string;
  readonly size: DashSize;
  readonly accent: DashAccent;
  readonly label: string;
  readonly value: string;
  readonly delta?: string;
  readonly meta?: string;
  readonly sparkline?: readonly DashPoint[];
}

export interface DashAreaTile {
  readonly kind: 'area';
  readonly id: string;
  readonly size: DashSize;
  readonly accent: DashAccent;
  readonly heading: string;
  readonly meta: string;
  readonly points: readonly DashPoint[];
  readonly ariaLabel: string;
}

export interface DashBarTile {
  readonly kind: 'bar';
  readonly id: string;
  readonly size: DashSize;
  readonly accent: DashAccent;
  readonly heading: string;
  readonly meta: string;
  readonly items: readonly DashBarItem[];
  readonly ariaLabel: string;
}

export interface DashMetricTile {
  readonly kind: 'metrics';
  readonly id: string;
  readonly size: DashSize;
  readonly accent: DashAccent;
  readonly heading: string;
  readonly meta: string;
  readonly items: readonly DashMetricItem[];
  readonly ariaLabel: string;
}

export type DashTile = DashStatTile | DashAreaTile | DashBarTile | DashMetricTile;

/** Ordered bento tiles — rendered dynamically by the dashboard page. */
export const DASH_TILES: readonly DashTile[] = [
  {
    kind: 'stat',
    id: 'listeners',
    size: 'sm',
    accent: 'primary',
    label: 'Active listeners',
    value: '12.4k',
    delta: '+18%',
    meta: 'vs prior period',
  },
  {
    kind: 'stat',
    id: 'session',
    size: 'sm',
    accent: 'gold',
    label: 'Avg. session',
    value: '4m 12s',
    delta: '+6%',
    meta: 'Time on site',
  },
  {
    kind: 'stat',
    id: 'bounce',
    size: 'sm',
    accent: 'red',
    label: 'Bounce rate',
    value: '31%',
    delta: '-4%',
    meta: 'Lower is better',
  },
  {
    kind: 'stat',
    id: 'engagement',
    size: 'md',
    accent: 'primary',
    label: 'Engagement score',
    value: '78',
    delta: '+9%',
    meta: 'Composite of reads, stars, and return visits',
    sparkline: DASH_ENGAGEMENT_SPARK,
  },
  {
    kind: 'stat',
    id: 'retention',
    size: 'md',
    accent: 'gold',
    label: 'Retention',
    value: '64%',
    delta: '+2%',
    meta: 'Users who returned within 7 days',
    sparkline: DASH_RETENTION_SPARK,
  },
  {
    kind: 'area',
    id: 'weekly-activity',
    size: 'hero',
    accent: 'primary',
    heading: 'Weekly activity',
    meta: 'Sessions · last 8 weeks',
    points: DASH_SESSIONS_MONTH,
    ariaLabel: 'Weekly sessions over the last eight weeks',
  },
  {
    kind: 'bar',
    id: 'top-channels',
    size: 'lg',
    accent: 'gold',
    heading: 'Top channels',
    meta: 'Traffic sources',
    items: DASH_TOP_CHANNELS,
    ariaLabel: 'Traffic by channel',
  },
  {
    kind: 'metrics',
    id: 'top-content',
    size: 'lg',
    accent: 'red',
    heading: 'Top content',
    meta: 'Most opened',
    items: DASH_TOP_CONTENT,
    ariaLabel: 'Top content by opens',
  },
  {
    kind: 'area',
    id: 'this-week',
    size: 'lg',
    accent: 'primary',
    heading: 'This week',
    meta: 'Daily listeners',
    points: DASH_LISTENERS_WEEK,
    ariaLabel: 'Daily listeners this week',
  },
  {
    kind: 'bar',
    id: 'devices',
    size: 'lg',
    accent: 'gold',
    heading: 'Devices',
    meta: 'Share of sessions',
    items: DASH_DEVICE_MIX,
    ariaLabel: 'Sessions by device type',
  },
];
