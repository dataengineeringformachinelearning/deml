import { Routes } from '@angular/router';

import { getBlogPost } from './data/blog-posts';
import { getLearnTopic } from './data/packages';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'DEML',
    data: { preload: 'guest' },
  },
  {
    path: 'learn',
    loadComponent: () => import('./pages/learn/learn').then((m) => m.Learn),
    title: 'Learn · DEML',
    data: { preload: 'guest' },
  },
  {
    path: 'learn/:slug',
    loadComponent: () => import('./pages/learn-topic/learn-topic').then((m) => m.LearnTopicPage),
    title: (route) => {
      const topic = getLearnTopic(String(route.params['slug'] ?? ''));
      return topic ? `${topic.title} · Learn · DEML` : 'Topic not found · DEML';
    },
  },
  {
    path: 'about',
    redirectTo: 'learn',
    pathMatch: 'full',
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
      return post ? `${post.title} · DEML` : 'Post not found · DEML';
    },
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    title: 'Log in · DEML',
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
    loadComponent: () => import('./pages/status/status').then((m) => m.Status),
    title: 'Status · DEML',
    data: { preload: 'guest' },
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
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard · DEML',
    data: { preload: 'auth' },
  },
  {
    path: 'analytics',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/analytics/analytics').then((m) => m.Analytics),
    title: 'Analytics · DEML',
    data: { preload: 'auth' },
  },
  {
    path: 'vulnerabilities',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/vulnerabilities/vulnerabilities').then((m) => m.Vulnerabilities),
    title: 'Vulnerabilities · DEML',
    data: { preload: 'auth' },
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
    canActivate: [authGuard],
    loadComponent: () => import('./pages/sites/sites').then((m) => m.Sites),
    title: 'Sites · DEML',
    data: { preload: 'auth' },
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/account/account').then((m) => m.Account),
    title: 'Account · DEML',
    data: { preload: 'auth' },
  },
  {
    path: 'pipeline',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'success',
    loadComponent: () => import('./pages/success/success').then((m) => m.Success),
    title: 'Success · DEML',
  },
  {
    path: 'auth-status',
    loadComponent: () => import('./pages/auth-status/auth-status').then((m) => m.AuthStatus),
    title: 'Auth status · DEML',
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
    title: 'Not found · DEML',
  },
];
