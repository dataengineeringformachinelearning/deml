import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'status/:slug',
    renderMode: RenderMode.Server,
  },
  // Auth + settings — CSR only (session / Firebase)
  { path: 'settings', renderMode: RenderMode.Client },
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'signup', renderMode: RenderMode.Client },
  { path: 'mfa', renderMode: RenderMode.Client },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
