import { lazy } from 'react';

export const routes = [
  {
    path: '/',
    Component: lazy(() => import('./pages/LandingPage'))
  },
  {
    path: '/papers',
    Component: lazy(() => import('./pages/HomePage'))
  },
  {
    path: '/paper/:arxivId',
    Component: lazy(() => import('./pages/PaperPage'))
  },
  {
    path: '/auth/login',
    Component: lazy(() => import('./pages/LoginPage')),
  },
  {
    path: '/auth/signup',
    Component: lazy(() => import('./pages/SignupPage')),
  },
  {
    path: '/saved',
    Component: lazy(() => import('./pages/FeedPage')),
  }
];
