import type { DashMetricItem, DashPoint } from '../components/dashboard/dashboard.types';
import type { DashTile } from './dashboard';

export const STATUS_UPTIME_SPARK: readonly DashPoint[] = [
  { label: '1', value: 99.1 },
  { label: '2', value: 99.4 },
  { label: '3', value: 99.2 },
  { label: '4', value: 99.8 },
  { label: '5', value: 99.9 },
  { label: '6', value: 99.7 },
  { label: '7', value: 99.9 },
];

export const STATUS_SERVICES: readonly DashMetricItem[] = [
  { label: 'Control plane API', value: 'Up', meta: 'deml-backend' },
  { label: 'Auth edge', value: 'Up', meta: 'Firebase' },
  { label: 'Sealed stream', value: 'Up', meta: 'FORJD' },
  { label: 'Object storage', value: 'Up', meta: 'Artifacts' },
];

/** Status board — equal-height KPI + service list tiles. */
export const STATUS_TILES: readonly DashTile[] = [
  {
    kind: 'stat',
    id: 'api',
    size: 'sm',
    accent: 'primary',
    label: 'API',
    value: 'Up',
    meta: 'Control plane',
  },
  {
    kind: 'stat',
    id: 'queue',
    size: 'sm',
    accent: 'gold',
    label: 'Queue',
    value: 'Up',
    meta: 'Ingress buffer',
  },
  {
    kind: 'stat',
    id: 'storage',
    size: 'sm',
    accent: 'red',
    label: 'Storage',
    value: 'Up',
    meta: 'Object plane',
  },
  {
    kind: 'stat',
    id: 'uptime',
    size: 'md',
    accent: 'gold',
    label: 'Uptime',
    value: '99.9%',
    delta: '+0.1%',
    meta: 'Rolling 7 days',
    sparkline: STATUS_UPTIME_SPARK,
  },
  {
    kind: 'metrics',
    id: 'services',
    size: 'wide',
    accent: 'primary',
    heading: 'Services',
    meta: 'Continuity checklist',
    items: STATUS_SERVICES,
    ariaLabel: 'Service health checklist',
  },
];
