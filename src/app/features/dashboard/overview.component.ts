import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { SystemStats, Pet, Advertisement, Report } from '../../core/models';

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
  imports: [
    CommonModule, RouterModule, CardModule, ButtonModule, SkeletonModule,
    ChartModule, TableModule, TagModule, TooltipModule, DatePipe
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  loading = signal(true);
  error = signal('');
  statCards = signal<StatCard[]>([]);
  stats = signal<SystemStats | null>(null);
  recentPets = signal<Pet[]>([]);
  pendingAds = signal<Advertisement[]>([]);
  recentReports = signal<Report[]>([]);
  readonly skeletonItems = [1, 2, 3, 4, 5, 6];

  // Chart configs
  petStatusChartData = signal<any>(null);
  petStatusChartOptions = signal<any>(null);
  adStatusChartData = signal<any>(null);
  adStatusChartOptions = signal<any>(null);
  userChartData = signal<any>(null);
  userChartOptions = signal<any>(null);
  petGenderChartData = signal<any>(null);
  petGenderChartOptions = signal<any>(null);

  // Computed analytics
  adoptionRate = computed(() => {
    const s = this.stats();
    if (!s || s.pets.total === 0) return 0;
    return Math.round((s.pets.adopted / s.pets.total) * 100);
  });

  activeUserRate = computed(() => {
    const s = this.stats();
    if (!s || s.users.total === 0) return 0;
    return Math.round((s.users.active / s.users.total) * 100);
  });

  adApprovalRate = computed(() => {
    const s = this.stats();
    if (!s || s.advertisements.total === 0) return 0;
    return Math.round((s.advertisements.approved / s.advertisements.total) * 100);
  });

  vaccinationRate = computed(() => {
    const pets = this.recentPets();
    if (!pets.length) return 0;
    const vaccinated = pets.filter(p => p.vaccinated).length;
    return Math.round((vaccinated / pets.length) * 100);
  });

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      stats: this.api.getSystemStats(),
      pets: this.api.getPets(0, 500),
      ads: this.api.getPendingAdvertisements(1, 10),
      reports: this.api.getReports(0, 10)
    }).subscribe({
      next: (res) => {
        const s = res.stats.data;
        this.stats.set(s);

        // Recent pets (sorted by date)
        const allPets = res.pets.data.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        this.recentPets.set(allPets.slice(0, 8));
        this.pendingAds.set(res.ads.data.items.slice(0, 5));
        this.recentReports.set(res.reports.data.slice(0, 5));

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

        // Build charts from real data
        this.buildCharts(s, allPets);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Could not load statistics');
        this.loading.set(false);
      }
    });
  }

  private buildCharts(s: SystemStats, allPets: Pet[]): void {
    const chartFont = { family: "'Inter', sans-serif" };

    // --- Pet Status Distribution (Doughnut) ---
    const statusCounts = this.countByField(allPets, 'status');
    const statusLabels = ['Available', 'Adopted', 'Lost', 'Found', 'Help'];
    const statusKeys = ['available', 'adopted', 'lost', 'found', 'help'];
    const statusColors = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];

    this.petStatusChartData.set({
      labels: statusLabels,
      datasets: [{
        data: statusKeys.map(k => statusCounts[k] || 0),
        backgroundColor: statusColors,
        hoverBackgroundColor: statusColors.map(c => c + 'dd'),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    });
    this.petStatusChartOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { ...chartFont, size: 12 } } }
      }
    });

    // --- Ad Status Distribution (Doughnut) ---
    this.adStatusChartData.set({
      labels: ['Pending', 'Approved', 'Rejected'],
      datasets: [{
        data: [s.advertisements.pending, s.advertisements.approved, s.advertisements.rejected],
        backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
        hoverBackgroundColor: ['#f59e0bdd', '#10b981dd', '#ef4444dd'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    });
    this.adStatusChartOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { ...chartFont, size: 12 } } }
      }
    });

    // --- Users Active vs Inactive (Bar) ---
    this.userChartData.set({
      labels: ['Active', 'Inactive'],
      datasets: [{
        label: 'Users',
        data: [s.users.active, s.users.inactive],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['#10b981', '#ef4444'],
        borderWidth: 1,
        borderRadius: 8,
        barPercentage: 0.6
      }]
    });
    this.userChartOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { ...chartFont, size: 12 } } },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { font: { ...chartFont, size: 11 }, stepSize: 1 }
        }
      }
    });

    // --- Pet Gender Distribution (Doughnut) ---
    const genderCounts = this.countByField(allPets, 'gender');
    const genderLabels = Object.keys(genderCounts).map(g => g || 'Unknown');
    const genderColors = ['#6366f1', '#ec4899', '#94a3b8', '#14b8a6', '#f97316'];

    this.petGenderChartData.set({
      labels: genderLabels,
      datasets: [{
        data: Object.values(genderCounts),
        backgroundColor: genderColors.slice(0, genderLabels.length),
        hoverBackgroundColor: genderColors.slice(0, genderLabels.length).map(c => c + 'dd'),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    });
    this.petGenderChartOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { ...chartFont, size: 12 } } }
      }
    });
  }

  private countByField(items: any[], field: string): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const item of items) {
      const val = item[field] || 'Unknown';
      counts[val] = (counts[val] || 0) + 1;
    }
    return counts;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      available: 'success', adopted: 'info', lost: 'danger',
      found: 'warning', help: 'warning',
      pending: 'warning', approved: 'success', rejected: 'danger'
    };
    return map[status] || 'neutral';
  }

  getReportIcon(type: string): string {
    const map: Record<string, string> = {
      pet: 'pi pi-heart', advertisement: 'pi pi-megaphone', profile: 'pi pi-user'
    };
    return map[type] || 'pi pi-flag';
  }
}
