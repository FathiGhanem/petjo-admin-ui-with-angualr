import { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./categories-list.component').then(m => m.CategoriesListComponent)
  }
];
