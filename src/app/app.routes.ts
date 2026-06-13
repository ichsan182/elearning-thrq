import { Routes } from '@angular/router';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Home },
  {
    path: 'manage-storage',
    loadComponent: () =>
      import('./app/features/manage-storage/manage-storage').then(m => m.ManageStorage),
  },
  {
    path: 'manage-user',
    loadComponent: () =>
      import('./app/features/manage-user/manage-user').then(m => m.ManageUser),
  },
  { path: '**', redirectTo: 'dashboard' },
];
