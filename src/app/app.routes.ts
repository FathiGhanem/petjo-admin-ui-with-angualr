import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/overview.component').then(m => m.OverviewComponent)
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES)
      },
      {
        path: 'pets',
        loadChildren: () => import('./features/pets/pets.routes').then(m => m.PETS_ROUTES)
      },
      {
        path: 'advertisements',
        loadChildren: () => import('./features/advertisements/advertisements.routes').then(m => m.ADS_ROUTES)
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES)
      },
      {
        path: 'categories',
        loadChildren: () => import('./features/categories/categories.routes').then(m => m.CATEGORIES_ROUTES)
      },
      {
        path: 'cities',
        loadChildren: () => import('./features/cities/cities.routes').then(m => m.CITIES_ROUTES)
      },
      {
        path: 'heroes',
        loadChildren: () => import('./features/heroes/heroes.routes').then(m => m.HEROES_ROUTES)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
