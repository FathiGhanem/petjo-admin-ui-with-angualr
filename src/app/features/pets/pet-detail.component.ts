import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { ImageModule } from 'primeng/image';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import {
  Pet,
  PetPhoto,
  PetStatus,
  User,
  Advertisement,
  Category,
  City
} from '../../core/models';

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, CardModule, ButtonModule, TagModule,
    TooltipModule, SkeletonModule, ImageModule, TableModule,
    ToastModule, DatePipe
  ],
  providers: [MessageService],
  templateUrl: './pet-detail.component.html',
  styleUrls: ['./pet-detail.component.scss']
})
export class PetDetailComponent implements OnInit {
  pet = signal<Pet | null>(null);
  photos = signal<PetPhoto[]>([]);
  owner = signal<User | null>(null);
  ownerAds = signal<Advertisement[]>([]);
  categories = signal<Category[]>([]);
  cities = signal<City[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  categoryName = computed(() => {
    const p = this.pet();
    const cats = this.categories();
    if (!p?.category_id || !cats.length) return null;
    return cats.find(c => c.id === p.category_id)?.name ?? null;
  });

  cityName = computed(() => {
    const p = this.pet();
    const c = this.cities();
    if (!p?.city_id || !c.length) return null;
    return c.find(city => city.id === p.city_id)?.name ?? null;
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly msg: MessageService
  ) {}

  ngOnInit(): void {
    const petId = this.route.snapshot.paramMap.get('id');
    if (petId) {
      this.loadPetData(petId);
    }
  }

  private loadPetData(petId: string): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      pet: this.api.getPet(petId),
      photos: this.api.getPetPhotos(petId),
      categories: this.api.getCategories(),
      cities: this.api.getCities()
    }).subscribe({
      next: (res) => {
        this.pet.set(res.pet.data);
        this.photos.set(res.photos.data);
        this.categories.set(res.categories.data);
        this.cities.set(res.cities.data);

        // Load owner & owner's ads
        const ownerId = res.pet.data.owner_id;
        if (ownerId) {
          this.api.getUserById(ownerId).subscribe({
            next: (user) => this.owner.set(user),
            error: () => {} // owner data is optional
          });

          // Load all ads and filter by owner
          this.api.getAllAdvertisements(1, 200).subscribe({
            next: (adsRes) => {
              const ownerAds = adsRes.data.items.filter(
                (ad) => ad.user_id === ownerId
              );
              this.ownerAds.set(ownerAds);
            },
            error: () => {}
          });
        }

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.detail || 'Failed to load pet details');
        this.loading.set(false);
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to load pet' });
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

  getAdStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return map[status] || 'neutral';
  }
}
