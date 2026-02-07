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
import { Category } from '../../core/models';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, CardModule,
    ToastModule, ConfirmDialogModule, DialogModule, InputTextModule, TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './categories-list.component.html',
  styleUrls: ['./categories-list.component.scss']
})
export class CategoriesListComponent implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(false);
  dialogVisible = false;
  editingCategory = signal<Category | null>(null);
  formName = '';
  formImageUrl = '';

  constructor(
    private readonly api: ApiService,
    private readonly msg: MessageService,
    private readonly confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.api.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load categories' });
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    this.editingCategory.set(null);
    this.formName = '';
    this.formImageUrl = '';
    this.dialogVisible = true;
  }

  openEditDialog(cat: Category): void {
    this.editingCategory.set(cat);
    this.formName = cat.name;
    this.formImageUrl = cat.image_url || '';
    this.dialogVisible = true;
  }

  save(): void {
    if (!this.formName.trim()) return;

    const data = {
      name: this.formName.trim(),
      image_url: this.formImageUrl.trim() || undefined
    };

    const editing = this.editingCategory();

    const op$ = editing
      ? this.api.updateCategory(editing.id, data)
      : this.api.createCategory(data as any);

    op$.subscribe({
      next: () => {
        this.dialogVisible = false;
        this.msg.add({
          severity: 'success',
          summary: 'Success',
          detail: editing ? 'Category updated' : 'Category created'
        });
        this.loadCategories();
      },
      error: (err) => this.msg.add({
        severity: 'error', summary: 'Error',
        detail: err.error?.detail || 'Operation failed'
      })
    });
  }

  confirmDelete(cat: Category): void {
    this.confirm.confirm({
      message: `Delete category "${cat.name}"? This will fail if pets are using it.`,
      header: 'Delete Category',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deleteCategory(cat.id).subscribe({
          next: () => {
            this.msg.add({ severity: 'success', summary: 'Success', detail: 'Category deleted' });
            this.loadCategories();
          },
          error: (err) => this.msg.add({
            severity: 'error', summary: 'Error',
            detail: err.error?.detail || 'Failed to delete category'
          })
        });
      }
    });
  }
}
