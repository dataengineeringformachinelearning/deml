export interface NavLink {
  label: string;
  path: string;
}

/** Primary nav when logged out. */
export const GUEST_NAV_LINKS: NavLink[] = [
  { label: 'Home', path: '/' },
  { label: 'Learn', path: '/learn' },
  { label: 'Blog', path: '/blog' },
];

/** Primary nav when logged in. */
export const AUTH_NAV_LINKS: NavLink[] = [
  { label: 'Home', path: '/' },
  { label: 'Learn', path: '/learn' },
  { label: 'Blog', path: '/blog' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Sites', path: '/sites' },
  { label: 'Account', path: '/account' },
];
