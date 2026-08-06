import type { CardVisual } from '../components/card/card';

export interface UtilityCard {
  readonly id: string;
  readonly heading: string;
  readonly subtext: string;
  readonly visual: CardVisual;
  readonly cta: string;
  readonly href: string;
}

/** 404 recovery destinations. */
export const NOT_FOUND_CARDS: readonly UtilityCard[] = [
  {
    id: 'home',
    heading: 'Home',
    subtext: 'Return to the main composition and explore surfaces.',
    visual: 'olive',
    cta: 'Go home',
    href: '/',
  },
  {
    id: 'learn',
    heading: 'Learn',
    subtext: 'Browse packages and reference notes in the catalog.',
    visual: 'gold',
    cta: 'Open Learn',
    href: '/learn',
  },
  {
    id: 'blog',
    heading: 'Blue Notes',
    subtext: 'Field log of platform releases, architecture, and operator capabilities.',
    visual: 'red',
    cta: 'Read notes',
    href: '/blog',
  },
];

/** Post-success next steps. */
export const SUCCESS_CARDS: readonly UtilityCard[] = [
  {
    id: 'dashboard',
    heading: 'Dashboard',
    subtext: 'See live metrics for your workspace.',
    visual: 'olive',
    cta: 'Open dashboard',
    href: '/dashboard',
  },
  {
    id: 'sites',
    heading: 'Sites',
    subtext: 'Review connected environments and deployments.',
    visual: 'gold',
    cta: 'Manage sites',
    href: '/settings#sites',
  },
  {
    id: 'settings',
    heading: 'Settings',
    subtext: 'Confirm profile, sites, and workspace preferences.',
    visual: 'red',
    cta: 'Open settings',
    href: '/settings',
  },
];

/** Auth status destinations. */
export const AUTH_STATUS_CARDS: readonly UtilityCard[] = [
  {
    id: 'settings',
    heading: 'Settings',
    subtext: 'Profile, sites, and workspace controls.',
    visual: 'olive',
    cta: 'Open settings',
    href: '/settings',
  },
  {
    id: 'login',
    heading: 'Log in',
    subtext: 'Sign in to bind identity to this workspace.',
    visual: 'gold',
    cta: 'Log in',
    href: '/login',
  },
  {
    id: 'status',
    heading: 'Platform status',
    subtext: 'Browse public status pages in the directory.',
    visual: 'red',
    cta: 'Explore',
    href: '/explore',
  },
];
