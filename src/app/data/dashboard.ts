import type {
  DashBarItem,
  DashMetricItem,
  DashPoint,
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
