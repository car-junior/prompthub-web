import { Routes } from '@angular/router';
import { adminGuard } from '../core/guards/role.guard';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: '', redirectTo: 'prompts', pathMatch: 'full' },
      {
        path: 'prompts',
        loadChildren: () => import('../prompts/prompts.routes').then(m => m.PROMPTS_ROUTES),
      },
      {
        path: 'teams',
        loadChildren: () => import('../teams/teams.routes').then(m => m.TEAMS_ROUTES),
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadChildren: () => import('../users/users.routes').then(m => m.USERS_ROUTES),
      },
      {
        path: 'tags',
        canActivate: [adminGuard],
        loadChildren: () => import('../tags/tags.routes').then(m => m.TAGS_ROUTES),
      },
      {
        path: 'profile',
        loadComponent: () => import('../profile/profile.component').then(m => m.ProfileComponent),
      },
    ],
  },
];
