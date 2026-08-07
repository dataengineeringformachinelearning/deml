import { RenderMode, ServerRoute } from '@angular/ssr';

import { BLUE_NOTES } from './data/blue-notes';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return BLUE_NOTES.map(post => ({ slug: post.slug }));
    },
  },
  {
    path: 'status/:slug',
    renderMode: RenderMode.Server,
  },
  // Auth + settings — CSR only (session / Firebase)
  { path: 'settings', renderMode: RenderMode.Client },
  { path: 'account', renderMode: RenderMode.Client },
  { path: 'sites', renderMode: RenderMode.Client },
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'signup', renderMode: RenderMode.Client },
  { path: 'mfa', renderMode: RenderMode.Client },
  // Retired redirects with params — must not hit prerender **
  { path: 'learn/:slug', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
