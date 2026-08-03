import type { DashBarItem, DashMetricItem, DashPoint } from '../components/dashboard/dashboard.types';
import type { DashTile } from './dashboard';

export const VULN_TREND: readonly DashPoint[] = [
  { label: 'W1', value: 42 },
  { label: 'W2', value: 38 },
  { label: 'W3', value: 35 },
  { label: 'W4', value: 31 },
  { label: 'W5', value: 28 },
  { label: 'W6', value: 24 },
  { label: 'W7', value: 22 },
  { label: 'W8', value: 18 },
];

export const VULN_BY_SEVERITY: readonly DashBarItem[] = [
  { label: 'Critical', value: 2, display: '2' },
  { label: 'High', value: 9, display: '9' },
  { label: 'Medium', value: 21, display: '21' },
  { label: 'Low', value: 44, display: '44' },
];

export const VULN_OPEN: readonly DashMetricItem[] = [
  { label: 'CVE-2024-21887', value: 'Critical', meta: 'Edge proxy' },
  { label: 'CVE-2024-3094', value: 'High', meta: 'Build toolchain' },
  { label: 'GHSA-xxxx-1', value: 'High', meta: 'JS runtime' },
  { label: 'GHSA-xxxx-2', value: 'Medium', meta: 'Image base' },
];

/** Findings board — charts only inside chart-card via tile-board. */
export const VULN_TILES: readonly DashTile[] = [
  {
    kind: 'stat',
    id: 'critical',
    size: 'sm',
    accent: 'red',
    label: 'Critical',
    value: '2',
    meta: 'Needs immediate review',
  },
  {
    kind: 'stat',
    id: 'high',
    size: 'sm',
    accent: 'gold',
    label: 'High',
    value: '9',
    meta: 'Remediation queue',
  },
  {
    kind: 'stat',
    id: 'resolved',
    size: 'sm',
    accent: 'primary',
    label: 'Resolved',
    value: '128',
    delta: '+14',
    meta: 'Last 90 days',
  },
  {
    kind: 'area',
    id: 'trend',
    size: 'hero',
    accent: 'primary',
    heading: 'Open findings',
    meta: 'Count · last 8 weeks',
    points: VULN_TREND,
    ariaLabel: 'Open vulnerability count over eight weeks',
  },
  {
    kind: 'bar',
    id: 'severity',
    size: 'lg',
    accent: 'red',
    heading: 'By severity',
    meta: 'Open inventory',
    items: VULN_BY_SEVERITY,
    ariaLabel: 'Open findings by severity',
  },
  {
    kind: 'metrics',
    id: 'queue',
    size: 'lg',
    accent: 'gold',
    heading: 'Priority queue',
    meta: 'Highest severity first',
    items: VULN_OPEN,
    ariaLabel: 'Priority vulnerability queue',
  },
];
