import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Vercel static hosting: CSR-only routes.
 * Full prerender OOMs the 8GB build machine — CSR on Vercel.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
