import type { DashBarItem, DashMetricItem, DashPoint } from '../components/dashboard/dashboard.types';

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
    subtext: 'Primary marketing presence with blog and learn routes.',
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
