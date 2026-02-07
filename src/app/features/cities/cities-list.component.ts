import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';
import { City } from '../../core/models';

@Component({
  selector: 'app-cities-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, CardModule,
    ToastModule, ConfirmDialogModule, DialogModule, InputTextModule, TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './cities-list.component.html',
  styleUrls: ['./cities-list.component.scss']
})
export class CitiesListComponent implements OnInit {
  cities = signal<City[]>([]);
  loading = signal(false);
  dialogVisible = false;
  editingCity = signal<City | null>(null);
  formName = '';

  constructor(
    private readonly api: ApiService,
    private readonly msg: MessageService,
    private readonly confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadCities();
  }

  loadCities(): void {
    this.loading.set(true);
    this.api.getCities().subscribe({
      next: (res) => {
        this.cities.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load cities' });
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    this.editingCity.set(null);
    this.formName = '';
    this.dialogVisible = true;
  }

  openEditDialog(city: City): void {
    this.editingCity.set(city);
    this.formName = city.name;
    this.dialogVisible = true;
  }

  save(): void {
    if (!this.formName.trim()) return;

    const data = { name: this.formName.trim() };
    const editing = this.editingCity();

    const op$ = editing
      ? this.api.updateCity(editing.id, data)
      : this.api.createCity(data);

    op$.subscribe({
      next: () => {
        this.dialogVisible = false;
        this.msg.add({
          severity: 'success',
          summary: 'Success',
          detail: editing ? 'City updated' : 'City created'
        });
        this.loadCities();
      },
      error: (err) => this.msg.add({
        severity: 'error', summary: 'Error',
        detail: err.error?.detail || 'Operation failed'
      })
    });
  }

  confirmDelete(city: City): void {
    this.confirm.confirm({
      message: `Delete "${city.name}"? This will fail if pets or users are using it.`,
      header: 'Delete City',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deleteCity(city.id).subscribe({
          next: () => {
            this.msg.add({ severity: 'success', summary: 'Success', detail: 'City deleted' });
            this.loadCities();
          },
          error: (err) => this.msg.add({
            severity: 'error', summary: 'Error',
            detail: err.error?.detail || 'Failed to delete city'
          })
        });
      }
    });
  }
}
