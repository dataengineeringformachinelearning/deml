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
  lede: 'Identity, status, analytics, and learning in one warm-ash surface — FORJD stays the sealed data plane.',
} as const;

/**
 * Marketing destination cards only — never Settings hash sections
 * (account / sites / preferences live exclusively on `/settings`).
 */
export const HOME_DESTINATIONS: readonly HomeCard[] = [
  {
    id: 'explore',
    heading: 'Explore',
    subtext: 'Browse the public status directory — live SLA, latency, and uptime mega-cards.',
    visual: 'olive',
    actions: [
      { label: 'Open directory', routerLink: '/explore', variant: 'primary' },
      { label: 'Platform status', routerLink: '/status/platform-status', variant: 'secondary' },
    ],
  },
  {
    id: 'dashboard',
    heading: 'Dashboard',
    subtext: 'Workspace pulse for sessions, traffic, and continuity signals across your accounts.',
    visual: 'red',
    guestPrimary: { label: 'Sign in', routerLink: '/login', variant: 'primary' },
    signedInPrimary: { label: 'Open dashboard', routerLink: '/dashboard', variant: 'primary' },
    actions: [{ label: 'Analytics', routerLink: '/analytics', variant: 'secondary' }],
  },
  {
    id: 'learn',
    heading: 'Learn',
    subtext: 'Catalog of packages, install paths, and reference notes for the stack.',
    visual: 'gold',
    actions: [
      { label: 'Open catalog', routerLink: '/learn', variant: 'primary' },
      { label: 'Read the blog', routerLink: '/blog', variant: 'secondary' },
    ],
  },
  {
    id: 'analytics',
    heading: 'Analytics',
    subtext: 'Projection-backed charts for traffic and continuity — same aspect contract app-wide.',
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
    eyebrow: 'Control plane',
    title: 'Identity & tenancy',
    description:
      'Firebase-authenticated accounts, roles, consent, and explicit FORJD tenant binding — fail closed on mismatch.',
  },
  {
    id: 'status',
    eyebrow: 'Public',
    title: 'Status & directories',
    description:
      'Publish status pages and browse the directory. Platform health stays separate from account site management.',
  },
  {
    id: 'insights',
    eyebrow: 'Signals',
    title: 'Analytics & dashboards',
    description:
      'Read projections through the BFF. Charts keep a fixed aspect and equal inset so peers never squash plots.',
  },
  {
    id: 'learn',
    eyebrow: 'Docs',
    title: 'Learn the stack',
    description:
      'Direct-dependency catalog and notes for backend, frontend, Rust engine, and infra — no cluttered stubs.',
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
