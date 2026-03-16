import { Routes } from '@angular/router';
import { adminGuard } from '../core/guards/role.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: '', redirectTo: 'teams', pathMatch: 'full' },
      {
        path: 'teams',
        loadChildren: () => import('../teams/teams.routes').then(m => m.TEAMS_ROUTES),
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadChildren: () => import('../users/users.routes').then(m => m.USERS_ROUTES),
      },
    ],
  },
];
