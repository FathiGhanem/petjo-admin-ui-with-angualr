import { Routes } from '@angular/router';

export const ADS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./advertisements-list.component').then(m => m.AdvertisementsListComponent)
  }
];
