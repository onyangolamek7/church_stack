import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthUser } from '../../services/auth';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit, OnDestroy {
  user: AuthUser | null = null;

  // ── Edit profile form ───────────────────────────────────────────────────────
  editForm    = { name: '', email: '', diocese: '' };
  editLoading = false;
  editSuccess = '';
  editError   = '';

  // ── Change password form ────────────────────────────────────────────────────
  pwForm      = { current_password: '', password: '', password_confirmation: '' };
  pwLoading   = false;
  pwSuccess   = '';
  pwError     = '';
  showCurrent = false;
  showNew     = false;
  showConfirm = false;

  // ── Avatar ──────────────────────────────────────────────────────────────────
  avatarUploading  = false;
  avatarSuccess    = '';
  avatarError      = '';
  avatarPreview: string | null = null;
  /** Toggles the Change / Remove mini-menu */
  showAvatarMenu   = false;

  private editSuccessTimer?:   ReturnType<typeof setTimeout>;
  private pwSuccessTimer?:     ReturnType<typeof setTimeout>;
  private avatarSuccessTimer?: ReturnType<typeof setTimeout>;

  readonly dioceses = [
    'Kisumu Central Diocese',
    'Nairobi Diocese',
    'Mombasa Diocese',
    'Kisumu South Diocese',
    'Siaya Diocese',
    'Rift Valley Diocese',
    'Upper Milambo Diocese',
    'Lower Milambo Diocese',
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
    clearTimeout(this.avatarSuccessTimer);
  }

  // ── Computed getters ────────────────────────────────────────────────────────
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

  get avatarUrl(): string | null {
    return this.avatarPreview ?? this.user?.avatar_url ?? null;
  }

  // ── Avatar menu ─────────────────────────────────────────────────────────────
  toggleAvatarMenu(): void {
    if (this.avatarUploading) return;
    this.showAvatarMenu = !this.showAvatarMenu;
  }

  closeAvatarMenu(): void {
    this.showAvatarMenu = false;
  }

  triggerFileInput(input: HTMLInputElement): void {
    this.showAvatarMenu = false;
    input.click();
  }

  onAvatarSelected(event: Event, input: HTMLInputElement): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => (this.avatarPreview = e.target?.result as string);
    reader.readAsDataURL(file);

    this.avatarUploading = true;
    this.avatarSuccess   = '';
    this.avatarError     = '';

    this.auth.uploadAvatar(file).subscribe({
      next: res => {
        this.user            = res.user;
        this.avatarPreview   = null;
        this.avatarUploading = false;
        this.avatarSuccess   = res.message;
        clearTimeout(this.avatarSuccessTimer);
        this.avatarSuccessTimer = setTimeout(() => (this.avatarSuccess = ''), 4000);
        input.value = '';
      },
      error: err => {
        this.avatarPreview   = null;
        this.avatarUploading = false;
        this.avatarError     = err?.error?.message ?? 'Failed to upload profile picture.';
        input.value = '';
      },
    });
  }

  removeAvatar(): void {
    this.showAvatarMenu  = false;
    if (!this.user?.avatar_url || this.avatarUploading) return;

    this.avatarUploading = true;
    this.avatarSuccess   = '';
    this.avatarError     = '';

    this.auth.deleteAvatar().subscribe({
      next: res => {
        this.user            = res.user;
        this.avatarUploading = false;
        this.avatarSuccess   = 'Profile picture removed.';
        clearTimeout(this.avatarSuccessTimer);
        this.avatarSuccessTimer = setTimeout(() => (this.avatarSuccess = ''), 4000);
      },
      error: err => {
        this.avatarUploading = false;
        this.avatarError     = err?.error?.message ?? 'Failed to remove profile picture.';
      },
    });
  }

  // ── Profile form ─────────────────────────────────────────────────────────────
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

  // ── Password form ─────────────────────────────────────────────────────────────
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
        this.pwError = errors
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
