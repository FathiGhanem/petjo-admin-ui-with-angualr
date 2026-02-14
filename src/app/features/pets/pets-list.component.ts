import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';
import { Pet, PetStatus } from '../../core/models';

@Component({
  selector: 'app-pets-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, TableModule, ButtonModule, TagModule, CardModule,
    ToastModule, ConfirmDialogModule, SelectModule, InputTextModule,
    TooltipModule, ToggleSwitchModule, DialogModule, DatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './pets-list.component.html',
  styleUrls: ['./pets-list.component.scss']
})
export class PetsListComponent implements OnInit {
  pets = signal<Pet[]>([]);
  loading = signal(false);
  selectedPet = signal<Pet | null>(null);
  statusDialogVisible = false;
  newStatus = '';
  selectedStatus = '';
  includeDeleted = false;

  readonly statusOptions = [
    { label: 'Available', value: 'available' },
    { label: 'Adopted', value: 'adopted' },
    { label: 'Lost', value: 'lost' },
    { label: 'Found', value: 'found' },
    { label: 'Help', value: 'help' }
  ];

  readonly petStatusOptions = [...this.statusOptions];

  constructor(
    private readonly api: ApiService,
    private readonly msg: MessageService,
    private readonly confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadPets();
  }

  loadPets(): void {
    this.loading.set(true);
    this.api.getPets(0, 500, this.selectedStatus || undefined, this.includeDeleted).subscribe({
      next: (res) => {
        this.pets.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load pets' });
        this.loading.set(false);
      }
    });
  }

  getStatusClass(status: PetStatus): string {
    const map: Record<PetStatus, string> = {
      available: 'success',
      adopted: 'info',
      lost: 'danger',
      found: 'warning',
      help: 'warning'
    };
    return map[status] || 'neutral';
  }

  openStatusDialog(pet: Pet): void {
    this.selectedPet.set(pet);
    this.newStatus = '';
    this.statusDialogVisible = true;
  }

  updateStatus(): void {
    const pet = this.selectedPet();
    if (!pet || !this.newStatus) return;

    this.api.updatePetStatus(pet.id, this.newStatus).subscribe({
      next: () => {
        this.statusDialogVisible = false;
        this.msg.add({ severity: 'success', summary: 'Success', detail: `Status updated to ${this.newStatus}` });
        this.loadPets();
      },
      error: (err) => this.msg.add({
        severity: 'error', summary: 'Error',
        detail: err.error?.detail || 'Failed to update status'
      })
    });
  }

  confirmDelete(pet: Pet, permanent: boolean): void {
    const action = permanent ? 'permanently delete' : 'soft delete';
    this.confirm.confirm({
      message: `Are you sure you want to ${action} "${pet.name}"?${permanent ? ' This cannot be undone.' : ''}`,
      header: permanent ? 'Permanent Delete' : 'Soft Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deletePet(pet.id, permanent).subscribe({
          next: () => {
            this.msg.add({ severity: 'success', summary: 'Success', detail: `"${pet.name}" deleted` });
            this.loadPets();
          },
          error: (err) => this.msg.add({
            severity: 'error', summary: 'Error',
            detail: err.error?.detail || 'Failed to delete pet'
          })
        });
      }
    });
  }
}
