import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  user: any;

  constructor(private auth: AuthService) {
    this.user = this.auth.getStoredUser();
  }

  logout() {
    this.auth.logout();
  }

}
