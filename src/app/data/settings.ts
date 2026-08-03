import type { CardVisual } from '../components/card/card';

export interface SettingsCard {
  readonly id: string;
  readonly heading: string;
  readonly subtext: string;
  readonly visual: CardVisual;
  readonly cta: string;
  readonly href: string;
}

/** Settings modules — interactive cards, same rhythm as account prefs. */
export const SETTINGS_CARDS: readonly SettingsCard[] = [
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
    id: 'notifications',
    heading: 'Notifications',
    subtext: 'Email delivery and alert preferences for this workspace.',
    visual: 'gold',
    cta: 'Open delivery',
    href: '/account',
  },
  {
    id: 'sites',
    heading: 'Connected sites',
    subtext: 'Environments linked to this account and their status.',
    visual: 'olive',
    cta: 'Manage sites',
    href: '/sites',
  },
];
