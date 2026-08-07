import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

/**
 * Core product only: identity + public status + site management.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'DEML',
    data: { preload: 'guest' },
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
    path: 'explore',
    loadComponent: () => import('./pages/explore/explore').then((m) => m.Explore),
    title: 'Explore · DEML',
    data: { preload: 'guest' },
  },
  {
    path: 'status/:slug',
    loadComponent: () =>
      import('./pages/isolated-status/isolated-status').then((m) => m.IsolatedStatus),
    title: 'Status · DEML',
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
    title: 'Settings · DEML',
    data: { preload: 'auth' },
  },
  {
    // Headless iframe bridge for Django chrome — not product navigation.
    path: 'auth-bridge',
    loadComponent: () => import('./pages/auth-bridge/auth-bridge').then((m) => m.AuthBridge),
    title: 'DEML',
    data: { bareShell: true },
  },
  { path: 'status', pathMatch: 'full', redirectTo: 'explore' },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Not found · DEML',
  },
];
