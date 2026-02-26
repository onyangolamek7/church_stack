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
  constructor(private auth:AuthService) {
    if (this.auth.isLoggedIn()) {
      this.auth.initBackButtonLogout();
    }
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  logout(): void {
    this.auth.logout();
  }
}
