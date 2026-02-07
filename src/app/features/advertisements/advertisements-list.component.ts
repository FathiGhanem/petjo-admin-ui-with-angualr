import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';
import { Advertisement, AdvertisementStatus } from '../../core/models';

@Component({
  selector: 'app-advertisements-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, TagModule, CardModule,
    ToastModule, ConfirmDialogModule, SelectModule, InputTextModule,
    DialogModule, TextareaModule, TooltipModule, TabsModule, DatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './advertisements-list.component.html',
  styleUrls: ['./advertisements-list.component.scss']
})
export class AdvertisementsListComponent implements OnInit {
  ads = signal<Advertisement[]>([]);
  loading = signal(false);
  pendingCount = signal(0);
  activeTab: 'pending' | 'all' = 'pending';

  reviewDialogVisible = false;
  reviewingAd = signal<Advertisement | null>(null);
  reviewAction: 'approved' | 'rejected' = 'approved';
  adminNotes = '';

  viewDialogVisible = false;
  viewingAd = signal<Advertisement | null>(null);

  readonly tabs = [
    { label: 'Pending', value: 'pending' as const },
    { label: 'All', value: 'all' as const }
  ];

  constructor(
    private readonly api: ApiService,
    private readonly msg: MessageService,
    private readonly confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadAds();
    this.loadPendingCount();
  }

  switchTab(tab: 'pending' | 'all'): void {
    this.activeTab = tab;
    this.loadAds();
  }

  loadAds(): void {
    this.loading.set(true);
    const source$ = this.activeTab === 'pending'
      ? this.api.getPendingAdvertisements(1, 100)
      : this.api.getAllAdvertisements(1, 100);

    source$.subscribe({
      next: (res) => {
        this.ads.set(res.data.items);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Advertisement loading error:', err);
        const detail = err.error?.detail || err.error?.message || 'Failed to load advertisements';
        this.msg.add({ severity: 'error', summary: 'Error', detail });
        this.loading.set(false);
      }
    });
  }

  loadPendingCount(): void {
    this.api.getPendingAdvertisements(1, 1).subscribe({
      next: (res) => this.pendingCount.set(res.data.total)
    });
  }

  getStatusClass(status: AdvertisementStatus): string {
    const map: Record<AdvertisementStatus, string> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return map[status];
  }

  viewAd(ad: Advertisement): void {
    this.viewingAd.set(ad);
    this.viewDialogVisible = true;
  }

  openReviewDialog(ad: Advertisement, action: 'approved' | 'rejected'): void {
    this.reviewingAd.set(ad);
    this.reviewAction = action;
    this.adminNotes = '';
    this.reviewDialogVisible = true;
  }

  submitReview(): void {
    const ad = this.reviewingAd();
    if (!ad) return;

    this.api.reviewAdvertisement(ad.id, {
      status: this.reviewAction,
      admin_notes: this.adminNotes || undefined
    }).subscribe({
      next: () => {
        this.reviewDialogVisible = false;
        this.msg.add({
          severity: 'success',
          summary: 'Success',
          detail: `Advertisement ${this.reviewAction}`
        });
        this.loadAds();
        this.loadPendingCount();
      },
      error: (err) => this.msg.add({
        severity: 'error', summary: 'Error',
        detail: err.error?.detail || 'Failed to review advertisement'
      })
    });
  }

  confirmDelete(ad: Advertisement): void {
    this.confirm.confirm({
      message: `Delete "${ad.title}"? This cannot be undone.`,
      header: 'Delete Advertisement',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deleteAdvertisement(ad.id).subscribe({
          next: () => {
            this.msg.add({ severity: 'success', summary: 'Success', detail: 'Advertisement deleted' });
            this.loadAds();
            this.loadPendingCount();
          },
          error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete advertisement' })
        });
      }
    });
  }
}
