export interface NavLink {
  label: string;
  /** In-app router path (product surfaces). */
  path?: string;
  /** Absolute or site-relative href (community / external). */
  href?: string;
  external?: boolean;
}

const COMMUNITY = 'https://dataengineeringformachinelearning.com';

/** Shared writing + legal destinations on the community site. */
export const COMMUNITY_NAV_LINKS: readonly NavLink[] = [
  { label: 'Book', href: `${COMMUNITY}/book`, external: true },
  { label: 'Whitepaper', href: `${COMMUNITY}/whitepaper`, external: true },
  { label: 'Docs', href: `${COMMUNITY}/documentation`, external: true },
  { label: 'Blog', href: `${COMMUNITY}/blog`, external: true },
  { label: 'Compliance', href: `${COMMUNITY}/compliance`, external: true },
] as const;

/** Guest primary nav — product job + community suite. Brand covers Home. */
export const GUEST_NAV_LINKS: NavLink[] = [
  { label: 'Explore', path: '/explore' },
  ...COMMUNITY_NAV_LINKS,
];

/** Auth primary nav — status + account/sites + community suite. */
export const AUTH_NAV_LINKS: NavLink[] = [
  { label: 'Explore', path: '/explore' },
  { label: 'Settings', path: '/settings' },
  ...COMMUNITY_NAV_LINKS,
];
