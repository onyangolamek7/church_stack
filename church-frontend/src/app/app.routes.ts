import { Routes } from '@angular/router';
import { authGuard } from './auth-guard';
import { guestGuard } from './guest-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'hymns',
    loadComponent: () =>
      import('./pages/hymns/hymns').then(m => m.Hymns)
  },
  {
    path: 'sermons',
    loadComponent: () =>
      import('./pages/sermons/sermons').then(m => m.Sermons)
  },
  {
    path: 'tithe',
    loadComponent: () =>
      import('./pages/tithe/tithe').then(m => m.Tithe)
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/login/login').then(m => m.Login)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile').then(m => m.Profile)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/profile').then(m => m.Profile)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/register/register').then(m => m.Register)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
