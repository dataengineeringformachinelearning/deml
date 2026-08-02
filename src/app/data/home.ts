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

export const HOME_CARDS: readonly HomeCard[] = [
  {
    id: 'write',
    heading: 'Write',
    subtext: 'Capture ideas with a calm, focused editor.',
    visual: 'gold',
    actions: [
      { label: 'Learn more', routerLink: '/blog', variant: 'primary' },
      { label: 'Learn', routerLink: '/learn', variant: 'secondary' },
    ],
  },
  {
    id: 'sites',
    heading: 'Sites',
    subtext: 'Ship a clean presence without the clutter.',
    visual: 'olive',
    guestPrimary: { label: 'Get started', routerLink: '/signup', variant: 'primary' },
    signedInPrimary: { label: 'Open Sites', routerLink: '/sites', variant: 'primary' },
    actions: [{ label: 'Learn more', routerLink: '/learn', variant: 'secondary' }],
  },
  {
    id: 'dashboard',
    heading: 'Dashboard',
    subtext: 'See what matters across your workspace.',
    visual: 'red',
    guestPrimary: { label: 'Sign in', routerLink: '/login', variant: 'primary' },
    signedInPrimary: { label: 'Open', routerLink: '/dashboard', variant: 'primary' },
    actions: [{ label: 'Read', routerLink: '/blog', variant: 'secondary' }],
  },
  {
    id: 'account',
    heading: 'Account',
    subtext: 'Preferences that stay out of the way.',
    visual: 'gold',
    guestPrimary: { label: 'Sign up', routerLink: '/signup', variant: 'primary' },
    signedInPrimary: { label: 'Manage', routerLink: '/account', variant: 'primary' },
    actions: [{ label: 'Learn more', routerLink: '/learn', variant: 'secondary' }],
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
