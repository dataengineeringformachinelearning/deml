import type { CardVisual } from '../components/card/card';
import type { ButtonVariant } from '../components/button/button';

export interface HomeCardAction {
  readonly label: string;
  readonly routerLink: string;
  readonly variant: ButtonVariant;
}

export interface HomeCard {
  readonly id: string;
  readonly heading: string;
  readonly subtext: string;
  readonly visual: CardVisual;
  readonly actions: readonly HomeCardAction[];
  /** When set, swaps the first action for guests vs signed-in users. */
  readonly guestPrimary?: HomeCardAction;
  readonly signedInPrimary?: HomeCardAction;
}

/** Home entry cards — product surfaces only (no fictional Write editor). */
export const HOME_CARDS: readonly HomeCard[] = [
  {
    id: 'explore',
    heading: 'Explore',
    subtext: 'Browse public status pages with live SLA, latency, and uptime.',
    visual: 'olive',
    actions: [
      { label: 'Open directory', routerLink: '/explore', variant: 'primary' },
      { label: 'Platform status', routerLink: '/status/platform-status', variant: 'secondary' },
    ],
  },
  {
    id: 'sites',
    heading: 'Sites',
    subtext: 'Connect domains, embed widgets, and manage monitored surfaces.',
    visual: 'gold',
    guestPrimary: { label: 'Get started', routerLink: '/signup', variant: 'primary' },
    signedInPrimary: { label: 'Manage sites', routerLink: '/settings#sites', variant: 'primary' },
    actions: [{ label: 'Learn the stack', routerLink: '/learn', variant: 'secondary' }],
  },
  {
    id: 'dashboard',
    heading: 'Dashboard',
    subtext: 'Workspace pulse for sessions, traffic, and continuity signals.',
    visual: 'red',
    guestPrimary: { label: 'Sign in', routerLink: '/login', variant: 'primary' },
    signedInPrimary: { label: 'Open dashboard', routerLink: '/dashboard', variant: 'primary' },
    actions: [{ label: 'Analytics', routerLink: '/analytics', variant: 'secondary' }],
  },
  {
    id: 'learn',
    heading: 'Learn',
    subtext: 'Catalog of packages, install paths, and reference notes for the stack.',
    visual: 'olive',
    actions: [
      { label: 'Open catalog', routerLink: '/learn', variant: 'primary' },
      { label: 'Read the blog', routerLink: '/blog', variant: 'secondary' },
    ],
  },
];

export function resolveHomeCardActions(
  card: HomeCard,
  loggedIn: boolean,
): readonly HomeCardAction[] {
  const primary = loggedIn ? card.signedInPrimary : card.guestPrimary;
  if (primary) {
    return [primary, ...card.actions];
  }
  return card.actions;
}
