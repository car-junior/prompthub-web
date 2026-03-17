import { Routes } from '@angular/router';

export const PROMPTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./prompt-list/prompt-list.component').then(m => m.PromptListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./prompt-form/prompt-form.component').then(m => m.PromptFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./prompt-detail/prompt-detail.component').then(m => m.PromptDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./prompt-form/prompt-form.component').then(m => m.PromptFormComponent),
  },
];
