// Core models for PetJo Admin Dashboard

// ===== API Response Types =====

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ===== Auth =====

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// ===== User =====

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  city?: string;
  preferences?: Record<string, unknown>;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at?: string;
}

// ===== Pet =====

export type PetStatus = 'available' | 'adopted' | 'lost' | 'found' | 'help';
export type PetVisibility = 'public' | 'private';

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  category_id?: number;
  breed?: string;
  age?: number;
  gender?: string;
  vaccinated: boolean;
  spayed: boolean;
  description?: string;
  city_id?: number;
  main_photo_url?: string;
  status: PetStatus;
  visibility: PetVisibility;
  phone_number?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

// ===== Advertisement =====

export type AdvertisementStatus = 'pending' | 'approved' | 'rejected';

export interface Advertisement {
  id: number;
  user_id: string;
  title: string;
  description: string;
  contact_phone?: string;
  status: AdvertisementStatus;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
  reviewed_at?: string;
  user_email?: string;
  user_name?: string;
}

export interface AdvertisementReview {
  status: 'approved' | 'rejected';
  admin_notes?: string;
}

// ===== Category =====

export interface Category {
  id: number;
  name: string;
  image_url?: string;
}

export interface CategoryCreate {
  name: string;
  image_url?: string;
}

// ===== City =====

export interface City {
  id: number;
  name: string;
}

export interface CityCreate {
  name: string;
}

// ===== Hero =====

export interface Hero {
  id: number;
  img_path?: string;
  link?: string;
  created_at: string;
}

export interface HeroCreate {
  img_path: string;
  link?: string;
}

// ===== Report =====

export type ReportTargetType = 'pet' | 'advertisement' | 'profile';

export interface Report {
  id: number;
  reporter_id?: string;
  target_type: ReportTargetType;
  target_id: number;
  reported_user_id?: string;
  reason: string;
  created_at: string;
}

// ===== Dashboard Stats =====

export interface SystemStats {
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  pets: {
    total: number;
    available: number;
    adopted: number;
  };
  advertisements: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  categories: number;
  cities: number;
}
