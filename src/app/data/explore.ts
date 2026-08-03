import type { CardVisual } from '../components/card/card';
import type { ButtonVariant } from '../components/button/button';

export interface ExploreCard {
  readonly id: string;
  readonly heading: string;
  readonly subtext: string;
  readonly visual: CardVisual;
  readonly cta: string;
  readonly href: string;
  readonly ctaVariant?: ButtonVariant;
}

/** Catalog entry points — card-grid composition, not fake KPIs. */
export const EXPLORE_CARDS: readonly ExploreCard[] = [
  {
    id: 'learn',
    heading: 'Learn',
    subtext: 'Packages, install paths, and reference notes for the stack.',
    visual: 'olive',
    cta: 'Open catalog',
    href: '/learn',
  },
  {
    id: 'blog',
    heading: 'Blog',
    subtext: 'Essays on clarity, craft, and calm software.',
    visual: 'gold',
    cta: 'Read notes',
    href: '/blog',
  },
  {
    id: 'status',
    heading: 'Status',
    subtext: 'Service health and continuity signals across the plane.',
    visual: 'red',
    cta: 'View status',
    href: '/status',
  },
  {
    id: 'dashboard',
    heading: 'Dashboard',
    subtext: 'Live pulse of listeners, sessions, and content opens.',
    visual: 'olive',
    cta: 'Open dashboard',
    href: '/dashboard',
  },
  {
    id: 'analytics',
    heading: 'Analytics',
    subtext: 'Threat and traffic boards from the control plane.',
    visual: 'gold',
    cta: 'Open analytics',
    href: '/analytics',
  },
  {
    id: 'account',
    heading: 'Account',
    subtext: 'Profile, security, and workspace preferences.',
    visual: 'red',
    cta: 'Manage account',
    href: '/account',
  },
];
