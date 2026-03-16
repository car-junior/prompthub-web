import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ChangePasswordRequest,
  JwtPayload
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY = 'prompthub_token';
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private _isAuthenticated$ = new BehaviorSubject<boolean>(this.hasValidToken());
  readonly isAuthenticated$ = this._isAuthenticated$.asObservable();

  // -------------------------------------------------------
  // Autenticação
  // -------------------------------------------------------

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveToken(response.token);
        this._isAuthenticated$.next(true);
      })
    );
  }

  register(data: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, data);
  }

  logout(): void {
    this.clearToken();
    this._isAuthenticated$.next(false);
    this.router.navigate(['/auth/login']);
  }

  // -------------------------------------------------------
  // Token
  // -------------------------------------------------------

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = this.decodeToken(token);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  decodeToken(token: string): JwtPayload {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayload;
  }

  getCurrentUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return this.decodeToken(token).sub;
    } catch {
      return null;
    }
  }

  getCurrentRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return this.decodeToken(token).role ?? null;
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getCurrentRole() === 'ADMIN';
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }
}
