import { RenderMode, ServerRoute } from '@angular/ssr';

import { BLOG_POSTS } from './data/blog-posts';
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
      return BLOG_POSTS.map((post) => ({ slug: post.slug }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
