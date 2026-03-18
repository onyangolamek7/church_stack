import { Component, signal } from '@angular/core';
import { RouterModule} from '@angular/router';
import { NgIf } from "@angular/common";
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ISRAEL CHURCH OF AFRICA');
  constructor(private auth:AuthService) {}

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

  logout(): void {
    this.auth.logout();
  }
}
