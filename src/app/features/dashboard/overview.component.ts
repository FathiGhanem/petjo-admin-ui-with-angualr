import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ApiService } from '../../core/services/api.service';
import { SystemStats } from '../../core/models';

interface StatCard {
  label: string;
  value: number;
  icon: string;
  gradient: string;
  route: string;
  details?: { label: string; value: number; type: string }[];
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, SkeletonModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  loading = signal(true);
  error = signal('');
  statCards = signal<StatCard[]>([]);
  readonly skeletonItems = [1, 2, 3, 4, 5, 6];

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading.set(true);
    this.error.set('');

    this.api.getSystemStats().subscribe({
      next: (res) => {
        const s = res.data;
        this.statCards.set([
          {
            label: 'Total Users',
            value: s.users.total,
            icon: 'pi pi-users',
            gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            route: '/users',
            details: [
              { label: 'active', value: s.users.active, type: 'success' },
              { label: 'inactive', value: s.users.inactive, type: 'danger' }
            ]
          },
          {
            label: 'Total Pets',
            value: s.pets.total,
            icon: 'pi pi-heart',
            gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
            route: '/pets',
            details: [
              { label: 'available', value: s.pets.available, type: 'success' },
              { label: 'adopted', value: s.pets.adopted, type: 'info' }
            ]
          },
          {
            label: 'Advertisements',
            value: s.advertisements.total,
            icon: 'pi pi-megaphone',
            gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            route: '/advertisements',
            details: [
              { label: 'pending', value: s.advertisements.pending, type: 'warning' },
              { label: 'approved', value: s.advertisements.approved, type: 'success' },
              { label: 'rejected', value: s.advertisements.rejected, type: 'danger' }
            ]
          },
          {
            label: 'Categories',
            value: s.categories,
            icon: 'pi pi-tags',
            gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
            route: '/categories'
          },
          {
            label: 'Cities',
            value: s.cities,
            icon: 'pi pi-map-marker',
            gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
            route: '/cities'
          }
        ]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Could not load statistics');
        this.loading.set(false);
      }
    });
  }
}
