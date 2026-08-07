import type { Router } from '@angular/router';

import { environment } from '../../../environments/environment';

/** Default post-login destination inside the Angular app. */
export const DEFAULT_POST_LOGIN_PATH = '/settings';

export type PostLoginTarget = { kind: 'app'; url: string } | { kind: 'external'; url: string };

type ResolveOptions = {
  marketingOrigin?: string;
  appOrigin?: string;
  fallback?: string;
};

type NavigateOptions = ResolveOptions & {
  /** Override for tests / SSR; defaults to `window.location.assign`. */
  assignLocation?: (url: string) => void;
};

const AUTH_PATHS = new Set(['/login', '/register', '/signup', '/mfa']);

const originOf = (value: string | undefined): string => {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) {
    return '';
  }
  try {
    return new URL(raw).origin;
  } catch {
    return '';
  }
};

const isAuthPath = (pathname: string): boolean => {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return AUTH_PATHS.has(normalized);
};

const isBareHomePath = (path: string): boolean => {
  try {
    const parsed = new URL(path, 'https://deml.invalid');
    return (parsed.pathname.replace(/\/+$/, '') || '/') === '/' && !parsed.search && !parsed.hash;
  } catch {
    return false;
  }
};

const isSafeAppPath = (path: string): boolean => {
  if (!path.startsWith('/') || path.startsWith('//')) {
    return false;
  }
  // Angular treats absolute URLs as path segments (e.g. "https:" → /https:).
  if (/^\/https?:/i.test(path)) {
    return false;
  }
  try {
    const parsed = new URL(path, 'https://deml.invalid');
    return !isAuthPath(parsed.pathname);
  } catch {
    return false;
  }
};

/**
 * Resolve a login `returnUrl` into an in-app router path or an allowed external URL.
 * Absolute same-origin URLs are reduced to pathname+search+hash so Angular never
 * receives a protocol string via `navigateByUrl`.
 */
export const resolvePostLoginTarget = (
  returnUrl: string | null | undefined,
  options: ResolveOptions = {},
): PostLoginTarget => {
  const fallback = options.fallback ?? DEFAULT_POST_LOGIN_PATH;
  const raw = typeof returnUrl === 'string' ? returnUrl.trim() : '';
  if (!raw) {
    return { kind: 'app', url: fallback };
  }

  if (isSafeAppPath(raw)) {
    // Bare home is not a useful post-login destination — land on settings.
    if (isBareHomePath(raw)) {
      return { kind: 'app', url: fallback };
    }
    return { kind: 'app', url: raw };
  }

  try {
    const absolute = new URL(raw);
    if (absolute.protocol !== 'http:' && absolute.protocol !== 'https:') {
      return { kind: 'app', url: fallback };
    }

    const marketingOrigin = options.marketingOrigin ?? '';
    if (marketingOrigin && absolute.origin === marketingOrigin) {
      return { kind: 'external', url: absolute.href };
    }

    const appOrigin = options.appOrigin ?? '';
    if (appOrigin && absolute.origin === appOrigin) {
      const path = `${absolute.pathname}${absolute.search}${absolute.hash}`;
      // Bare app origin should land on settings after sign-in.
      if (isBareHomePath(path)) {
        return { kind: 'app', url: fallback };
      }
      if (isSafeAppPath(path)) {
        return { kind: 'app', url: path };
      }
      return { kind: 'app', url: fallback };
    }
  } catch {
    // Non-URL values fall through to the settings default.
  }

  return { kind: 'app', url: fallback };
};

/** Options derived from the running app environment. */
export const defaultPostLoginResolveOptions = (): ResolveOptions => {
  const appOrigin =
    originOf(environment.frontendUrl) ||
    (typeof window !== 'undefined' ? window.location.origin : '');
  return {
    marketingOrigin: originOf(environment.marketingUrl),
    appOrigin,
    fallback: DEFAULT_POST_LOGIN_PATH,
  };
};

/**
 * Navigate after successful authentication using a validated `returnUrl`.
 * Defaults to `/settings` when the param is missing or unsafe.
 */
export const navigateAfterLogin = async (
  router: Router,
  returnUrl: string | null | undefined,
  options: NavigateOptions = {},
): Promise<boolean> => {
  const target = resolvePostLoginTarget(returnUrl, {
    ...defaultPostLoginResolveOptions(),
    ...options,
  });

  if (target.kind === 'external') {
    const assign =
      options.assignLocation ??
      ((url: string) => {
        if (typeof window !== 'undefined') {
          window.location.assign(url);
        }
      });
    assign(target.url);
    return true;
  }

  return router.navigateByUrl(target.url);
};
