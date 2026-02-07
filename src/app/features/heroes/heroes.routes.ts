import { Routes } from '@angular/router';

export const HEROES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./heroes-list.component').then(m => m.HeroesListComponent)
  }
];
