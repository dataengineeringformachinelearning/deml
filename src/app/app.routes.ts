import { Routes } from '@angular/router';

import { getBlogPost } from './data/blog-posts';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    title: 'DEML',
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
    title: 'About · DEML',
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog').then((m) => m.Blog),
    title: 'Blog · DEML',
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
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard · DEML',
  },
  {
    path: 'sites',
    loadComponent: () => import('./pages/sites/sites').then((m) => m.Sites),
    title: 'Sites · DEML',
  },
  {
    path: 'account',
    loadComponent: () => import('./pages/account/account').then((m) => m.Account),
    title: 'Account · DEML',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
