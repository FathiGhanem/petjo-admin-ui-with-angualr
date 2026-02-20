import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';
import { Hero } from '../../core/models';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];

@Component({
  selector: 'app-heroes-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, CardModule,
    ToastModule, ConfirmDialogModule, DialogModule, InputTextModule,
    TooltipModule, ProgressBarModule, DatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './heroes-list.component.html',
  styleUrls: ['./heroes-list.component.scss']
})
export class HeroesListComponent implements OnInit {
  heroes = signal<Hero[]>([]);
  loading = signal(false);
  saving = signal(false);
  dialogVisible = false;
  editingHero = signal<Hero | null>(null);
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  formLink = '';
  dragOver = false;
  fileError: string | null = null;

  constructor(
    private readonly api: ApiService,
    private readonly msg: MessageService,
    private readonly confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadHeroes();
  }

  loadHeroes(): void {
    this.loading.set(true);
    this.api.getHeroes().subscribe({
      next: (res) => {
        this.heroes.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load heroes' });
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    this.editingHero.set(null);
    this.selectedFile = null;
    this.imagePreview = null;
    this.formLink = '';
    this.fileError = null;
    this.dialogVisible = true;
  }

  openEditDialog(hero: Hero): void {
    this.editingHero.set(hero);
    this.selectedFile = null;
    this.imagePreview = hero.img_path || null;
    this.formLink = hero.link || '';
    this.fileError = null;
    this.dialogVisible = true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File): void {
    this.fileError = null;

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.fileError = 'Invalid file type. Allowed: JPEG, PNG, WebP, HEIC';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      this.fileError = `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.fileError = null;
    // Keep existing image preview for edit mode
    const editing = this.editingHero();
    this.imagePreview = editing?.img_path || null;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  save(): void {
    const editing = this.editingHero();

    // For create, file is required
    if (!editing && !this.selectedFile) return;
    if (this.saving()) return;

    this.saving.set(true);

    const formData = new FormData();
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
    if (this.formLink.trim()) {
      formData.append('link', this.formLink.trim());
    }

    const op$ = editing
      ? this.api.updateHero(editing.id, formData)
      : this.api.createHero(formData);

    op$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible = false;
        this.msg.add({
          severity: 'success',
          summary: 'Success',
          detail: editing ? 'Hero updated' : 'Hero created'
        });
        this.loadHeroes();
      },
      error: (err) => {
        this.saving.set(false);
        this.msg.add({
          severity: 'error', summary: 'Error',
          detail: err.error?.detail || 'Operation failed'
        });
      }
    });
  }

  confirmDelete(hero: Hero): void {
    this.confirm.confirm({
      message: `Delete hero item #${hero.id}?`,
      header: 'Delete Hero',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deleteHero(hero.id).subscribe({
          next: () => {
            this.msg.add({ severity: 'success', summary: 'Success', detail: 'Hero deleted' });
            this.loadHeroes();
          },
          error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete hero' })
        });
      }
    });
  }
}
