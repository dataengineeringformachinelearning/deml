import { RenderMode, ServerRoute } from '@angular/ssr';

import { BLUE_NOTES } from './data/blue-notes';
import { LEARN_TOPICS } from './data/packages';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'learn/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return LEARN_TOPICS.map((topic) => ({ slug: topic.slug }));
    },
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return BLUE_NOTES.map((post) => ({ slug: post.slug }));
    },
  },
  {
    path: 'status/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Client,
  },
  {
    path: 'analytics',
    renderMode: RenderMode.Client,
  },
  {
    path: 'vulnerabilities',
    renderMode: RenderMode.Client,
  },
  {
    path: 'settings',
    renderMode: RenderMode.Client,
  },
  {
    path: 'account',
    renderMode: RenderMode.Client,
  },
  {
    path: 'sites',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
