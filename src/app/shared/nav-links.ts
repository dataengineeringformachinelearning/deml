export interface NavLink {
  label: string;
  path: string;
}

/** Primary nav when logged out. */
export const GUEST_NAV_LINKS: NavLink[] = [
  { label: 'Home', path: '/' },
  { label: 'Learn', path: '/learn' },
  { label: 'Blue Notes', path: '/blog' },
  { label: 'Explore', path: '/explore' },
];

/** Primary nav when logged in. */
export const AUTH_NAV_LINKS: NavLink[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Vulnerabilities', path: '/vulnerabilities' },
  { label: 'Settings', path: '/settings' },
];
