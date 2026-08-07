export interface NavLink {
  label: string;
  path: string;
}

/** Guest primary nav — product job only. Brand covers Home. */
export const GUEST_NAV_LINKS: NavLink[] = [{ label: 'Explore', path: '/explore' }];

/** Auth primary nav — status + account/sites. */
export const AUTH_NAV_LINKS: NavLink[] = [
  { label: 'Explore', path: '/explore' },
  { label: 'Settings', path: '/settings' },
];
