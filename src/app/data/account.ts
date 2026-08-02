import type { DashMetricItem } from '../components/dashboard/dashboard.types';

export interface AccountPrefCard {
  readonly id: string;
  readonly heading: string;
  readonly subtext: string;
  readonly visual: 'gold' | 'red' | 'olive';
  readonly cta: string;
  readonly href: string;
}

export const ACCOUNT_PREF_CARDS: readonly AccountPrefCard[] = [
  {
    id: 'profile',
    heading: 'Profile',
    subtext: 'Name, avatar, and how you appear across DEML.',
    visual: 'olive',
    cta: 'Edit profile',
    href: '/account',
  },
  {
    id: 'security',
    heading: 'Security',
    subtext: 'Sessions, sign-in methods, and recovery options.',
    visual: 'red',
    cta: 'Review security',
    href: '/account',
  },
  {
    id: 'billing',
    heading: 'Workspace',
    subtext: 'Plan, seats, and connected sites for this account.',
    visual: 'gold',
    cta: 'Open workspace',
    href: '/sites',
  },
];

export const ACCOUNT_ACTIVITY: readonly DashMetricItem[] = [
  { label: 'Signed in from Chrome', value: 'Now', meta: 'This device' },
  { label: 'Theme preference saved', value: 'Today', meta: 'Appearance' },
  { label: 'Connected Studio site', value: '2d ago', meta: 'Sites' },
];
