import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';
import { Report, ReportTargetType } from '../../core/models';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [
    CommonModule, TableModule, ButtonModule, TagModule, CardModule,
    ToastModule, InputTextModule, TooltipModule, DatePipe
  ],
  providers: [MessageService],
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss']
})
export class ReportsListComponent implements OnInit {
  reports = signal<Report[]>([]);
  loading = signal(false);

  constructor(
    private readonly api: ApiService,
    private readonly msg: MessageService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading.set(true);
    this.api.getReports(0, 500).subscribe({
      next: (res) => {
        this.reports.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load reports' });
        this.loading.set(false);
      }
    });
  }

  getTypeClass(type: ReportTargetType): string {
    const map: Record<ReportTargetType, string> = {
      pet: 'info',
      advertisement: 'warning',
      profile: 'danger'
    };
    return map[type] || 'neutral';
  }

  getTypeIcon(type: ReportTargetType): string {
    const map: Record<ReportTargetType, string> = {
      pet: 'pi pi-heart',
      advertisement: 'pi pi-megaphone',
      profile: 'pi pi-user'
    };
    return map[type] || 'pi pi-flag';
  }
}
