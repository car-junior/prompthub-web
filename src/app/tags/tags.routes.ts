import { Routes } from '@angular/router';

export const TAGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./tag-list/tag-list.component').then(m => m.TagListComponent),
  },
];
