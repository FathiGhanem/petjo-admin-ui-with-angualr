import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, EMPTY } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, ApiResponse } from '../models';

const TOKEN_KEY = environment.tokenKey;
const REFRESH_TOKEN_KEY = `${environment.tokenKey}_refresh`;
const API_URL = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<Record<string, unknown> | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    this.loadUserFromToken();
  }

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${API_URL}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setToken(response.data.access_token);
          this.setRefreshToken(response.data.refresh_token);
          this.loadUserFromToken();
        }
      })
    );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${API_URL}/auth/logout`, { refresh_token: refreshToken }).pipe(
        catchError(() => EMPTY)
      ).subscribe({ complete: () => this.clearAuth() });
    } else {
      this.clearAuth();
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = this.decodeJwt(token);
      return Date.now() < payload['exp'] * 1000;
    } catch {
      return false;
    }
  }

  getUserPayload(): Record<string, unknown> | null {
    return this.currentUserSubject.value;
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  private clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token && this.isAuthenticated()) {
      try {
        this.currentUserSubject.next(this.decodeJwt(token));
      } catch {
        this.clearAuth();
      }
    }
  }

  private decodeJwt(token: string): Record<string, any> {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    return JSON.parse(json);
  }
}
