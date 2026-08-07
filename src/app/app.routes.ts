import { Routes } from '@angular/router';

import { getBlogPost } from './data/blog-posts';
import { authGuard } from './guards/auth.guard';
import { settingsSectionRedirect } from './shared/settings-redirect';

/**
 * Core product: identity + public status + site management.
 * Writing (/blog) stays addressable; it is not primary chrome.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'DEML',
    data: { preload: 'guest' },
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog').then((m) => m.Blog),
    title: 'Blog · DEML',
    data: { preload: 'guest' },
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/blog-post/blog-post').then((m) => m.BlogPostPage),
    title: (route) => {
      const post = getBlogPost(String(route.params['slug'] ?? ''));
      return post ? `${post.title} · Blog · DEML` : 'Post not found · DEML';
    },
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    title: 'Log in · DEML',
    data: { preload: 'guest' },
  },
  {
    path: 'mfa',
    loadComponent: () => import('./pages/mfa/mfa').then((m) => m.Mfa),
    title: 'Verify · DEML',
    data: { preload: 'guest' },
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup').then((m) => m.Signup),
    title: 'Sign up · DEML',
    data: { preload: 'guest' },
  },
  {
    path: 'status',
    pathMatch: 'full',
    redirectTo: 'explore',
  },
  {
    path: 'status/:slug',
    loadComponent: () =>
      import('./pages/isolated-status/isolated-status').then((m) => m.IsolatedStatus),
    title: 'Status · DEML',
  },
  {
    path: 'explore',
    loadComponent: () => import('./pages/explore/explore').then((m) => m.Explore),
    title: 'Explore · DEML',
    data: { preload: 'guest' },
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
    title: 'Settings · DEML',
    data: { preload: 'auth' },
  },
  {
    path: 'sites',
    canActivate: [authGuard, settingsSectionRedirect('sites')],
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
    title: 'Settings · DEML',
  },
  {
    path: 'account',
    canActivate: [authGuard, settingsSectionRedirect('account')],
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
    title: 'Settings · DEML',
  },
  // --- Retired → core ---
  { path: 'dashboard', redirectTo: 'settings', pathMatch: 'full' },
  { path: 'learn', redirectTo: 'blog', pathMatch: 'full' },
  { path: 'learn/:slug', redirectTo: 'blog' },
  { path: 'about', redirectTo: 'explore', pathMatch: 'full' },
  { path: 'analytics', redirectTo: 'settings', pathMatch: 'full' },
  { path: 'vulnerabilities', redirectTo: 'settings', pathMatch: 'full' },
  { path: 'pipeline', redirectTo: 'settings', pathMatch: 'full' },
  { path: 'success', redirectTo: 'settings', pathMatch: 'full' },
  { path: 'auth-status', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Not found · DEML',
  },
];
