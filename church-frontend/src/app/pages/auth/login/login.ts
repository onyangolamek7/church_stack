import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginPayload } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit, OnDestroy {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  credentials: LoginPayload = { email: '', password: '' };

  loading      = false;
  errorMessage = '';
  showPassword = false;

  //Without this, every time the Login component mounts it adds another listener — they accumulate and all fire on every popstate event.
  private readonly popstateHandler = (): void => {
    if (this.auth.isLoggedIn()) {
      history.forward();
    }
  };

  ngOnInit(): void {
    //If already logged in and somehow landed on /login, redirect away.
    if (this.auth.isLoggedIn()) {
      const dest = this.auth.isAdmin() ? '/admin' : '/hymns';
      this.router.navigate([dest], { replaceUrl: true });
      return;
    }

    window.addEventListener('popstate', this.popstateHandler);
  }

  ngOnDestroy(): void {
    // FIX: Always clean up — remove the listener when Login unmounts.
    window.removeEventListener('popstate', this.popstateHandler);
  }

  login(): void {
    this.errorMessage = '';
    this.loading      = true;

    this.auth.login(this.credentials).subscribe({
      next: res => {
        this.loading = false;

        // Role-based redirect. history.replaceState is called inside
        // AuthService.login() so the back button won't return here.
        if (res.user.role === 'admin') {
          this.router.navigate(['/admin'], { replaceUrl: true });
        } else {
          const params    = new URLSearchParams(window.location.search);
          const returnUrl = params.get('returnUrl') ?? '/hymns';
          this.router.navigateByUrl(returnUrl, { replaceUrl: true });
        }
      },
      error: err => {
        this.loading      = false;
        this.errorMessage =
          err?.error?.message ??
          'Login failed. Please check your credentials.';
      },
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
