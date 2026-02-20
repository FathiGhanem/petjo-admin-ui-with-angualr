import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  PaginatedResponse,
  User,
  Pet,
  PetPhoto,
  Advertisement,
  AdvertisementReview,
  Category,
  CategoryCreate,
  City,
  CityCreate,
  Hero,
  Report,
  SystemStats
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly api = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  // ==================== SYSTEM STATS ====================

  getSystemStats(): Observable<ApiResponse<SystemStats>> {
    return this.http.get<ApiResponse<SystemStats>>(`${this.api}/admin/stats`);
  }

  // ==================== USERS ====================

  getUsers(skip = 0, limit = 100): Observable<ApiResponse<User[]>> {
    const params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit);
    return this.http.get<ApiResponse<User[]>>(`${this.api}/admin/users`, { params });
  }

  activateUser(userId: string): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(
      `${this.api}/admin/users/${userId}/activate`, {}
    );
  }

  deactivateUser(userId: string): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(
      `${this.api}/admin/users/${userId}/deactivate`, {}
    );
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/admin/users/${userId}`);
  }

  // ==================== PETS ====================

  getPets(skip = 0, limit = 100, status?: string, includeDeleted = false): Observable<ApiResponse<Pet[]>> {
    let params = new HttpParams()
      .set('skip', skip)
      .set('limit', limit)
      .set('include_deleted', includeDeleted);
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ApiResponse<Pet[]>>(`${this.api}/admin/pets`, { params });
  }

  updatePetStatus(petId: string, status: string): Observable<ApiResponse<Pet>> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<ApiResponse<Pet>>(
      `${this.api}/admin/pets/${petId}/status`, null, { params }
    );
  }

  deletePet(petId: string, permanent = false): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('permanent', permanent);
    return this.http.delete<ApiResponse<unknown>>(
      `${this.api}/admin/pets/${petId}`, { params }
    );
  }

  getPet(petId: string): Observable<ApiResponse<Pet>> {
    return this.http.get<ApiResponse<Pet>>(`${this.api}/pets/${petId}`);
  }

  getPetPhotos(petId: string): Observable<ApiResponse<PetPhoto[]>> {
    return this.http.get<ApiResponse<PetPhoto[]>>(`${this.api}/pets/${petId}/photos`);
  }

  // ==================== USERS ====================

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.api}/users/${userId}`);
  }

  // ==================== ADVERTISEMENTS ====================

  getPendingAdvertisements(page = 1, pageSize = 20): Observable<ApiResponse<PaginatedResponse<Advertisement>>> {
    const params = new HttpParams().set('page', page).set('page_size', pageSize);
    return this.http.get<ApiResponse<PaginatedResponse<Advertisement>>>(
      `${this.api}/advertisements/admin/pending`, { params }
    );
  }

  getAllAdvertisements(page = 1, pageSize = 20): Observable<ApiResponse<PaginatedResponse<Advertisement>>> {
    const params = new HttpParams().set('page', page).set('page_size', pageSize);
    return this.http.get<ApiResponse<PaginatedResponse<Advertisement>>>(
      `${this.api}/advertisements/admin/all`, { params }
    );
  }

  searchAdvertisements(q?: string, status?: string, page = 1, pageSize = 20): Observable<ApiResponse<PaginatedResponse<Advertisement>>> {
    let params = new HttpParams().set('page', page).set('page_size', pageSize);
    if (q) params = params.set('q', q);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<PaginatedResponse<Advertisement>>>(
      `${this.api}/advertisements/search`, { params }
    );
  }

  reviewAdvertisement(adId: number, review: AdvertisementReview): Observable<ApiResponse<Advertisement>> {
    return this.http.post<ApiResponse<Advertisement>>(
      `${this.api}/advertisements/admin/${adId}/review`, review
    );
  }

  deleteAdvertisement(adId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.api}/advertisements/admin/${adId}`
    );
  }

  // ==================== CATEGORIES ====================

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.api}/admin/categories`);
  }

  createCategory(data: CategoryCreate): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${this.api}/admin/categories`, data);
  }

  updateCategory(id: number, data: Partial<CategoryCreate>): Observable<ApiResponse<Category>> {
    return this.http.patch<ApiResponse<Category>>(`${this.api}/admin/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/admin/categories/${id}`);
  }

  // ==================== CITIES ====================

  getCities(): Observable<ApiResponse<City[]>> {
    return this.http.get<ApiResponse<City[]>>(`${this.api}/admin/cities`);
  }

  createCity(data: CityCreate): Observable<ApiResponse<City>> {
    return this.http.post<ApiResponse<City>>(`${this.api}/admin/cities`, data);
  }

  updateCity(id: number, data: Partial<CityCreate>): Observable<ApiResponse<City>> {
    return this.http.patch<ApiResponse<City>>(`${this.api}/admin/cities/${id}`, data);
  }

  deleteCity(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/admin/cities/${id}`);
  }

  // ==================== HEROES ====================

  getHeroes(skip = 0, limit = 100): Observable<ApiResponse<Hero[]>> {
    const params = new HttpParams().set('skip', skip).set('limit', limit);
    return this.http.get<ApiResponse<Hero[]>>(`${this.api}/admin/heroes`, { params });
  }

  getHero(id: number): Observable<ApiResponse<Hero>> {
    return this.http.get<ApiResponse<Hero>>(`${this.api}/admin/heroes/${id}`);
  }

  createHero(data: FormData): Observable<ApiResponse<Hero>> {
    return this.http.post<ApiResponse<Hero>>(`${this.api}/admin/heroes`, data);
  }

  updateHero(id: number, data: FormData): Observable<ApiResponse<Hero>> {
    return this.http.patch<ApiResponse<Hero>>(`${this.api}/admin/heroes/${id}`, data);
  }

  deleteHero(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/admin/heroes/${id}`);
  }

  // ==================== REPORTS ====================

  getReports(skip = 0, limit = 100): Observable<ApiResponse<Report[]>> {
    const params = new HttpParams().set('skip', skip).set('limit', limit);
    return this.http.get<ApiResponse<Report[]>>(`${this.api}/reports`, { params });
  }

  getReportsByTarget(targetType: string, targetId: number): Observable<ApiResponse<Report[]>> {
    return this.http.get<ApiResponse<Report[]>>(
      `${this.api}/reports/${targetType}/${targetId}`
    );
  }
}
