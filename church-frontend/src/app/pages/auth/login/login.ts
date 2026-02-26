import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  credentials = { email: '', password: '' };

  errorMessage = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}
  login() {
    this.loading = true;
    this.auth.login(this.credentials).subscribe({
      next: (res: any) => {
        this.auth.storeAuth(res);
        this.router.navigate(['/profile']);
      },

      error: () => {
        this.errorMessage = 'Invalid email or password, please try again.';
        this.loading = false;
      }

    });
  }

}
