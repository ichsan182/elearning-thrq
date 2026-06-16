import { Routes } from '@angular/router';
import { Home } from './home/home';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then(m => m.Login),
    canActivate: [guestGuard],
  },
  { path: 'dashboard', component: Home, canActivate: [authGuard] },
  {
    path: 'manage-storage',
    loadComponent: () =>
      import('./features/manage-storage/manage-storage').then(m => m.ManageStorage),
    canActivate: [authGuard],
    data: { role: 'Admin' },
  },
  {
    path: 'manage-user',
    loadComponent: () =>
      import('./features/manage-user/manage-user').then(m => m.ManageUser),
    canActivate: [authGuard],
    data: { role: 'Admin' },
  },
  { path: '**', redirectTo: 'dashboard' },
];
