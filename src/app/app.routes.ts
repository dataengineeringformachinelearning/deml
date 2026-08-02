import { Routes } from '@angular/router';

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
    path: '**',
    redirectTo: '',
  },
];
