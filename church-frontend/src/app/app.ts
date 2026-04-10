import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('ISRAEL CHURCH OF AFRICA');

  constructor(public auth: AuthService) {}

  ngOnInit(): void {}

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  /** Shows first name in the nav */
  get userName(): string {
    const name = this.auth.currentUser?.name ?? '';
    return name.split(' ')[0];
  }

  /** First letter of first name — fallback when no avatar */
  get userInitial(): string {
    return (this.auth.currentUser?.name ?? 'U')[0].toUpperCase();
  }

  /** Avatar URL — null when user has no photo */
  get userAvatar(): string | null {
    return this.auth.currentUser?.avatar_url ?? null;
  }

  logout(): void {
    this.auth.logout();
  }
}
