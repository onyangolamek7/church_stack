import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthUser } from '../../services/auth';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit, OnDestroy {
  user: AuthUser | null = null;

  // Edit profile form
  editForm    = { name: '', email: '', diocese: '' };
  editLoading = false;
  editSuccess = '';
  editError   = '';

  // Change password form
  pwForm      = { current_password: '', password: '', password_confirmation: '' };
  pwLoading   = false;
  pwSuccess   = '';
  pwError     = '';
  showCurrent = false;
  showNew     = false;
  showConfirm = false;

  private editSuccessTimer?: ReturnType<typeof setTimeout>;
  private pwSuccessTimer?:   ReturnType<typeof setTimeout>;

  readonly dioceses = [
    'Kisumu ArchDiocese',
    'Nairobi Diocese',
    'Mombasa Diocese',
    'Western Diocese',
    'Nyanza Diocese',
    'Rift Valley Diocese',
    'Eastern Diocese',
    'North Eastern Diocese',
    'Other / Visiting',
  ];

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.getStoredUser();
    this.patchEditForm();

    this.auth.getProfile().subscribe({
      next: (u) => {
        this.user = u;
        this.patchEditForm();
      },
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.editSuccessTimer);
    clearTimeout(this.pwSuccessTimer);
  }

  get initials(): string {
    return (this.user?.name ?? 'U')
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  get memberSince(): string {
    const d = this.user?.created_at;
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
  }

  get passwordsMatch(): boolean {
    return this.pwForm.password === this.pwForm.password_confirmation;
  }

  private patchEditForm(): void {
    if (this.user) {
      this.editForm.name    = this.user.name;
      this.editForm.email   = this.user.email;
      this.editForm.diocese = this.user.diocese ?? '';
    }
  }

  saveProfile(): void {
    this.editSuccess = '';
    this.editError   = '';
    this.editLoading = true;

    this.auth.updateProfile(this.editForm).subscribe({
      next: (res) => {
        this.user        = res.user;
        this.editLoading = false;

        this.editSuccess = res.message ?? 'Profile updated successfully!';
        clearTimeout(this.editSuccessTimer);
        this.editSuccessTimer = setTimeout(() => (this.editSuccess = ''), 4000);
      },
      error: (err) => {
        const errors = err?.error?.errors;
        this.editError = errors
          ? (Object.values(errors)[0] as string)
          : err?.error?.message ?? 'Failed to update profile.';
        this.editLoading = false;
      },
    });
  }

  changePassword(): void {
    this.pwSuccess = '';
    this.pwError   = '';

    if (!this.passwordsMatch) {
      this.pwError = 'New passwords do not match.';
      return;
    }

    this.pwLoading = true;

    this.auth.changePassword(this.pwForm).subscribe({
      next: (res) => {
        this.pwLoading = false;
        this.pwSuccess = res.message ?? 'Password changed successfully!';
        this.pwForm    = { current_password: '', password: '', password_confirmation: '' };

        clearTimeout(this.pwSuccessTimer);
        this.pwSuccessTimer = setTimeout(() => (this.pwSuccess = ''), 4000);
      },
      error: (err) => {
        const errors = err?.error?.errors;
        this.pwError   = errors
          ? (Object.values(errors)[0] as string)
          : err?.error?.message ?? 'Failed to change password.';
        this.pwLoading = false;
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
