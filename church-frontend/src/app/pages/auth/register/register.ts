import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  form = {
    name: '',
    email: '',
    diocese: '',
    password: '',
    password_confirmation: '',
  };

  errorMessage = '';
  successMessage = '';
  loading = false;
  showPassword = false;
  showConfirm = false;

  readonly dioceses = [
    'Nairobi Diocese',
    'Coast Diocese',
    'Western Diocese',
    'Nyanza Diocese',
    'Rift Valley Diocese',
    'Eastern Diocese',
    'North Eastern Diocese',
    'Mt. Kenya Diocese',
    'Other / Visiting',
  ];

  constructor(private auth: AuthService, private router: Router) {}

  get passwordsMatch(): boolean {
    return this.form.password === this.form.password_confirmation;
  }

  register() {
    this.errorMessage = '';

    // Client-side guard
    if (this.form.password !== this.form.password_confirmation) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (!this.form.diocese) {
      this.errorMessage = 'Please select your church diocese / branch.';
      return;
    }

    this.loading = true;

    this.auth.register(this.form).subscribe({
      next: (res) => {
        this.auth.storeAuth(res);
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        // Show the first validation error from Laravel, or a fallback
        const errors = err?.error?.errors;
        if (errors) {
          this.errorMessage = Object.values(errors)[0] as string;
        } else {
          this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
        }
        this.loading = false;
      },
    });
  }
}
