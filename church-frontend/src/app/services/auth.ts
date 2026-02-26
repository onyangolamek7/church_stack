import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface AuthResponse {
  user: any;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private userSubject = new BehaviorSubject<any>(this.getStoredUser());

  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }

  register(data:any) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  storeAuth(res: AuthResponse) {
    localStorage.setItem('auth_token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.userSubject.next(res.user);

    this.initBackButtonLogout(); //enable back logout
  }

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  private backListenerInitialized = false;

  initBackButtonLogout() {
    if (this.backListenerInitialized) return;

    window.addEventListener('popstate', () => {
      if (this.isLoggedIn()) {
        this.logout();
      }
    });
    this.backListenerInitialized = true;
  }
}
