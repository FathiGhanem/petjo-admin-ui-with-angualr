import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, TagModule,
    CardModule, ToastModule, ConfirmDialogModule, InputTextModule, TooltipModule, DatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal(false);

  constructor(
    private readonly api: ApiService,
    private readonly msg: MessageService,
    private readonly confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.api.getUsers().subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
        this.loading.set(false);
      }
    });
  }

  activateUser(user: User): void {
    this.api.activateUser(user.id).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Success', detail: `${user.email} activated` });
        this.loadUsers();
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to activate user' })
    });
  }

  confirmDeactivate(user: User): void {
    this.confirm.confirm({
      message: `Deactivate ${user.email}? They won't be able to log in.`,
      header: 'Confirm Deactivation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.api.deactivateUser(user.id).subscribe({
          next: () => {
            this.msg.add({ severity: 'success', summary: 'Success', detail: `${user.email} deactivated` });
            this.loadUsers();
          },
          error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to deactivate user' })
        });
      }
    });
  }

  confirmDelete(user: User): void {
    this.confirm.confirm({
      message: `Permanently delete ${user.email}? This cannot be undone.`,
      header: 'Delete User',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deleteUser(user.id).subscribe({
          next: () => {
            this.msg.add({ severity: 'success', summary: 'Success', detail: `${user.email} deleted` });
            this.loadUsers();
          },
          error: (err) => this.msg.add({
            severity: 'error', summary: 'Error',
            detail: err.error?.detail || 'Failed to delete user'
          })
        });
      }
    });
  }
}
