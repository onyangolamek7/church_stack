import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  form = {
    name: '',
    email: '',
    password: ''
  };

  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    this.auth.register(this.form).subscribe({
      next: (res) => {
        this.auth.storeAuth(res);
        this.router.navigate(['/profile']);
      },
      error: () => {
        this.errorMessage = 'Registration failed';
      }
    });
  }

}
