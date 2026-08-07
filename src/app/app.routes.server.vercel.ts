import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Vercel static hosting: CSR-only routes.
 * Full prerender of marketing/blog routes OOMs the 8GB build machine.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
