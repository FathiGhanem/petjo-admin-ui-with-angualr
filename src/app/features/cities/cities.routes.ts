import { Routes } from '@angular/router';

export const CITIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./cities-list.component').then(m => m.CitiesListComponent)
  }
];
