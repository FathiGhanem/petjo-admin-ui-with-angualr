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
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';
import { Hero } from '../../core/models';

@Component({
  selector: 'app-heroes-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, CardModule,
    ToastModule, ConfirmDialogModule, DialogModule, InputTextModule, TooltipModule, DatePipe
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './heroes-list.component.html',
  styleUrls: ['./heroes-list.component.scss']
})
export class HeroesListComponent implements OnInit {
  heroes = signal<Hero[]>([]);
  loading = signal(false);
  dialogVisible = false;
  editingHero = signal<Hero | null>(null);
  formImgPath = '';
  formLink = '';

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
    this.formImgPath = '';
    this.formLink = '';
    this.dialogVisible = true;
  }

  openEditDialog(hero: Hero): void {
    this.editingHero.set(hero);
    this.formImgPath = hero.img_path || '';
    this.formLink = hero.link || '';
    this.dialogVisible = true;
  }

  save(): void {
    if (!this.formImgPath.trim()) return;

    const data = {
      img_path: this.formImgPath.trim(),
      link: this.formLink.trim() || undefined
    };

    const editing = this.editingHero();

    const op$ = editing
      ? this.api.updateHero(editing.id, data)
      : this.api.createHero(data as any);

    op$.subscribe({
      next: () => {
        this.dialogVisible = false;
        this.msg.add({
          severity: 'success',
          summary: 'Success',
          detail: editing ? 'Hero updated' : 'Hero created'
        });
        this.loadHeroes();
      },
      error: (err) => this.msg.add({
        severity: 'error', summary: 'Error',
        detail: err.error?.detail || 'Operation failed'
      })
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
