import { Routes } from '@angular/router';

export const PETS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pets-list.component').then(m => m.PetsListComponent)
  }
];
