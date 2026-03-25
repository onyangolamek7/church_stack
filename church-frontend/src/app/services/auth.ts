import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id:                  number;
  name:                string;
  email:               string;
  diocese:             string;
  role:                'user' | 'admin';
  created_at?:         string;
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface RegisterPayload {
  name:                  string;
  email:                 string;
  diocese:               string;
  password:              string;
  password_confirmation: string;
}

export interface UpdateProfilePayload {
  name?:    string;
  email?:   string;
  diocese?: string;
}

export interface ChangePasswordPayload {
  current_password:      string;
  password:              string;
  password_confirmation: string;
}

export interface AuthResponse {
  user:     AuthUser;
  token:    string;
  message?: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base   = `${environment.apiUrl}/auth`;

  //Reactive state
  private readonly _currentUser$ = new BehaviorSubject<AuthUser | null>(
    this.loadUserFromStorage(),
  );

  readonly currentUser$: Observable<AuthUser | null> = this._currentUser$.asObservable();

  readonly isAuthenticated$: Observable<boolean> = this._currentUser$.pipe(
    map(user => !!user),
  );

  //Synchronous getters
  get currentUser(): AuthUser | null {
    return this._currentUser$.value;
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this._currentUser$.value && !!localStorage.getItem(TOKEN_KEY);
  }

  isAdmin(): boolean {
    return this._currentUser$.value?.role === 'admin';
  }

  getStoredUser(): AuthUser | null {
    return this._currentUser$.value;
  }

  storeAuth(res: AuthResponse): void {
    this.persistSession(res);
  }

  //Auth actions
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, payload).pipe(
      tap(res => {
        this.persistSession(res);
        history.replaceState(null, '', window.location.href);
      }),
      catchError(err => throwError(() => err)),
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, payload).pipe(
      tap(res => {
        this.persistSession(res);
        history.replaceState(null, '', window.location.href);
      }),
      catchError(err => throwError(() => err)),
    );
  }

  logout(redirectToLogin = true): void {
    this.http.post(`${this.base}/logout`, {}).pipe(
      catchError(() => throwError(() => null)),
    ).subscribe({
      complete: () => this.clearSession(redirectToLogin),
      error:    () => this.clearSession(redirectToLogin),
    });
  }

  fetchCurrentUser(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.base}/me`).pipe(
      tap(user => {
        this._currentUser$.next(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }),
      catchError(err => {
        this.clearSession(false);
        return throwError(() => err);
      }),
    );
  }

  //Profile actions
  getProfile(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${environment.apiUrl}/profile`).pipe(
      tap(user => {
        this._currentUser$.next(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }),
    );
  }

  updateProfile(payload: UpdateProfilePayload): Observable<{ message: string; user: AuthUser }> {
    return this.http
      .put<{ message: string; user: AuthUser }>(`${environment.apiUrl}/profile`, payload)
      .pipe(
        tap(res => {
          this._currentUser$.next(res.user);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        }),
      );
  }

  changePassword(payload: ChangePasswordPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/change-password`,
      payload,
    );
  }

  //Private helpers
  private persistSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this._currentUser$.next(res.user);
  }

  private clearSession(redirect: boolean): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser$.next(null);
    if (redirect) {
      this.router.navigate(['/login']);
    }
  }

  forceLogout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser$.next(null);
    this.router.navigate(['/login']);
  }

  private loadUserFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
