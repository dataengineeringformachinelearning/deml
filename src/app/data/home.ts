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

export interface HomePillar {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
}

/** Home hero — brand-first first viewport. */
export const HOME_HERO = {
  preheader: 'DEML',
  heading: 'Control plane for ML data.',
  lede: 'Identity, status, analytics, and learning — FORJD handles the sealed streaming engine.',
} as const;

/**
 * Marketing destination cards only — never Settings hash sections
 * (account / sites / preferences live exclusively on `/settings`).
 */
export const HOME_DESTINATIONS: readonly HomeCard[] = [
  {
    id: 'explore',
    heading: 'Explore',
    subtext: 'Public status directory — SLA, latency, and uptime at a glance.',
    visual: 'olive',
    actions: [
      { label: 'Open directory', routerLink: '/explore', variant: 'primary' },
      { label: 'Platform status', routerLink: '/status/platform-status', variant: 'secondary' },
    ],
  },
  {
    id: 'dashboard',
    heading: 'Dashboard',
    subtext: 'Your workspace pulse — sessions, traffic, and continuity.',
    visual: 'red',
    guestPrimary: { label: 'Sign in', routerLink: '/login', variant: 'primary' },
    signedInPrimary: { label: 'Dashboard', routerLink: '/dashboard', variant: 'primary' },
    actions: [{ label: 'Analytics', routerLink: '/analytics', variant: 'secondary' }],
  },
  {
    id: 'learn',
    heading: 'Learn',
    subtext: 'Catalog and notes for the stack you are building with.',
    visual: 'gold',
    actions: [
      { label: 'Open catalog', routerLink: '/learn', variant: 'primary' },
      { label: 'Read the blog', routerLink: '/blog', variant: 'secondary' },
    ],
  },
  {
    id: 'analytics',
    heading: 'Analytics',
    subtext: 'Charts for traffic and continuity — same look everywhere.',
    visual: 'olive',
    guestPrimary: { label: 'Sign in', routerLink: '/login', variant: 'primary' },
    signedInPrimary: { label: 'Open analytics', routerLink: '/analytics', variant: 'primary' },
    actions: [{ label: 'Dashboard', routerLink: '/dashboard', variant: 'secondary' }],
  },
] as const;

/** Control-plane value pillars — form-panel explainers, not Settings surfaces. */
export const HOME_PILLARS: readonly HomePillar[] = [
  {
    id: 'identity',
    eyebrow: 'You',
    title: 'Identity & accounts',
    description: 'Sign in, roles, consent, and your link to a FORJD tenant — kept local and clear.',
  },
  {
    id: 'status',
    eyebrow: 'Public',
    title: 'Status pages',
    description: 'Publish status and browse the directory without mixing in account settings.',
  },
  {
    id: 'insights',
    eyebrow: 'Signals',
    title: 'Analytics & dashboards',
    description: 'Read live projections through DEML. Charts stay the same size so nothing squashes.',
  },
  {
    id: 'learn',
    eyebrow: 'Docs',
    title: 'Learn the stack',
    description: 'Packages and notes for the control plane and sealed data plane.',
  },
] as const;

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
