import type {
  DashAccent,
  DashBarItem,
  DashMetricItem,
  DashPoint,
  DashSize,
} from '../components/dashboard/dashboard.types';
import type { DashTile } from './dashboard';

export interface SiteCard {
  readonly id: string;
  readonly heading: string;
  readonly subtext: string;
  readonly meta: string;
  readonly visual: 'gold' | 'red' | 'olive';
  readonly status: string;
}

export const SITE_CARDS: readonly SiteCard[] = [
  {
    id: 'studio',
    heading: 'Studio',
    subtext: 'Primary site with status embeds, blog, and learn routes.',
    meta: 'Live',
    visual: 'olive',
    status: 'Healthy',
  },
  {
    id: 'docs',
    heading: 'Docs',
    subtext: 'Reference site for package notes and install paths.',
    meta: 'Staging',
    visual: 'gold',
    status: 'Deploying',
  },
  {
    id: 'preview',
    heading: 'Preview',
    subtext: 'Ephemeral review environments for pull requests.',
    meta: 'Preview',
    visual: 'red',
    status: 'Idle',
  },
];

export const SITE_UPTIME_SPARK: readonly DashPoint[] = [
  { label: 'W1', value: 99.2 },
  { label: 'W2', value: 99.6 },
  { label: 'W3', value: 99.1 },
  { label: 'W4', value: 99.9 },
  { label: 'W5', value: 99.7 },
  { label: 'W6', value: 99.8 },
];

export const SITE_TRAFFIC: readonly DashBarItem[] = [
  { label: 'Studio', value: 8420, display: '8.4k' },
  { label: 'Docs', value: 3120, display: '3.1k' },
  { label: 'Preview', value: 980, display: '980' },
];

export const SITE_DEPLOYMENTS: readonly DashMetricItem[] = [
  { label: 'Studio · main', value: '2h ago', meta: 'Success' },
  { label: 'Docs · staging', value: '5h ago', meta: 'Success' },
  { label: 'Preview · pr-42', value: '1d ago', meta: 'Expired' },
];

/** Overview tiles for the sites page — same contract as the dashboard bento. */
export const SITE_TILES: readonly DashTile[] = [
  {
    kind: 'stat',
    id: 'live-sites',
    size: 'sm' satisfies DashSize,
    accent: 'primary' satisfies DashAccent,
    label: 'Live sites',
    value: '2',
    delta: '+1',
    meta: 'Connected environments',
  },
  {
    kind: 'stat',
    id: 'uptime',
    size: 'sm',
    accent: 'gold',
    label: 'Uptime',
    value: '99.8%',
    delta: '+0.2%',
    meta: 'Rolling 30 days',
    sparkline: SITE_UPTIME_SPARK,
  },
  {
    kind: 'stat',
    id: 'previews',
    size: 'sm',
    accent: 'red',
    label: 'Open previews',
    value: '1',
    meta: 'Pull request environments',
  },
  {
    kind: 'bar',
    id: 'traffic',
    size: 'lg',
    accent: 'primary',
    heading: 'Traffic by site',
    meta: 'Sessions · last 7 days',
    items: SITE_TRAFFIC,
    ariaLabel: 'Sessions by site',
  },
  {
    kind: 'metrics',
    id: 'deployments',
    size: 'lg',
    accent: 'gold',
    heading: 'Recent deployments',
    meta: 'Latest releases',
    items: SITE_DEPLOYMENTS,
    ariaLabel: 'Recent site deployments',
  },
];
