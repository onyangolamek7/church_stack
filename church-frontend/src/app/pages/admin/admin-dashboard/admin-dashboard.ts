import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth';
import { environment } from '../../../../environments/environment';

export interface AdminUser {
  id:          number;
  name:        string;
  email:       string;
  diocese:     string;
  role:        string;
  created_at:  string;
  last_login_at?: string;
}

export interface TitheRecord {
  id:         number;
  user:       { name: string; email: string };
  amount:     number;
  currency:   string;
  reference:  string;
  status:     string;
  created_at: string;
}

export interface ActivityLog {
  id:          number;
  user:        { name: string; email: string };
  action:      string;
  description: string;
  created_at:  string;
}

export interface AdminStats {
  total_users:   number;
  total_tithes:  number;
  total_revenue: number;
  active_today:  number;
}

export interface Hymn {
  id:     number;
  number: number;
  title:  string;
  lyrics: string;
}

export interface Sermon {
  id:          number;
  title:       string;
  description: string;
  speaker:     string;
  date:        string;
  video_url?:  string;
}

type Tab = 'overview' | 'users' | 'tithes' | 'activity' | 'hymns' | 'sermons';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private readonly http = inject(HttpClient);
  public  readonly auth = inject(AuthService);
  private readonly api  = environment.apiUrl;

  activeTab: Tab = 'overview';

  // Data
  stats:    AdminStats    = { total_users: 0, total_tithes: 0, total_revenue: 0, active_today: 0 };
  users:    AdminUser[]   = [];
  tithes:   TitheRecord[] = [];
  activity: ActivityLog[] = [];
  hymns:    Hymn[]        = [];
  sermons:  Sermon[]      = [];

  // Loading flags
  statsLoading    = true;
  usersLoading    = false;
  tithesLoading   = false;
  activityLoading = false;
  hymnsLoading    = false;
  sermonsLoading  = false;

  // Error messages per tab
  statsError    = '';
  usersError    = '';
  tithesError   = '';
  activityError = '';
  hymnsError    = '';
  sermonsError  = '';

  // Search
  userSearch  = '';
  titheSearch = '';
  hymnSearch  = '';

  // Hymn edit/create
  hymnForm: Partial<Hymn> = {};
  hymnEditId: number | null = null;
  hymnSaving  = false;
  hymnSuccess = '';
  hymnError   = '';

  // Sermon edit/create
  sermonForm: Partial<Sermon> = {};
  sermonEditId: number | null = null;
  sermonSaving  = false;
  sermonSuccess = '';
  sermonError   = '';

  // Confirm delete
  deleteConfirm: { type: 'hymn' | 'sermon'; id: number } | null = null;

  get adminName(): string {
    return this.auth.currentUser?.name ?? 'Admin';
  }

  //Filtered getters

  get filteredUsers(): AdminUser[] {
    const q = this.userSearch.toLowerCase();
    return q
      ? this.users.filter(u =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.diocese.toLowerCase().includes(q))
      : this.users;
  }

  get filteredTithes(): TitheRecord[] {
    const q = this.titheSearch.toLowerCase();
    return q
      ? this.tithes.filter(t =>
          t.user.name.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q) ||
          t.status.toLowerCase().includes(q))
      : this.tithes;
  }

  get filteredHymns(): Hymn[] {
    const q = this.hymnSearch.toLowerCase();
    return q
      ? this.hymns.filter(h =>
          h.title.toLowerCase().includes(q) ||
          String(h.number).includes(q))
      : this.hymns;
  }

  get totalRevenue(): string {
    return this.tithes
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
      .toLocaleString('en-KE', { style: 'currency', currency: 'KES' });
  }

  //Lifecycle
  ngOnInit(): void {
    this.loadStats();
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'users'    && !this.users.length)    this.loadUsers();
    if (tab === 'tithes'   && !this.tithes.length)   this.loadTithes();
    if (tab === 'activity' && !this.activity.length) this.loadActivity();
    if (tab === 'hymns'    && !this.hymns.length)    this.loadHymns();
    if (tab === 'sermons'  && !this.sermons.length)  this.loadSermons();
  }

  //Loaders
  private loadStats(): void {
    this.statsLoading = true;
    this.statsError   = '';
    this.http.get<AdminStats>(`${this.api}/admin/stats`).subscribe({
      next:  s  => { this.stats = s; this.statsLoading = false; },
      error: err => {
        this.statsLoading = false;
        this.statsError = err?.error?.message ?? 'Failed to load stats.';
      },
    });
  }

  private loadUsers(): void {
    this.usersLoading = true;
    this.usersError   = '';
    this.http.get<AdminUser[]>(`${this.api}/admin/users`).subscribe({
      next:  u  => { this.users = u; this.usersLoading = false; },
      error: err => {
        this.usersLoading = false;
        this.usersError = err?.error?.message ?? 'Failed to load users.';
      },
    });
  }

  private loadTithes(): void {
    this.tithesLoading = true;
    this.tithesError   = '';
    this.http.get<TitheRecord[]>(`${this.api}/admin/tithes`).subscribe({
      next:  t  => { this.tithes = t; this.tithesLoading = false; },
      error: err => {
        this.tithesLoading = false;
        this.tithesError = err?.error?.message ?? 'Failed to load tithe records.';
      },
    });
  }

  private loadActivity(): void {
    this.activityLoading = true;
    this.activityError   = '';
    this.http.get<ActivityLog[]>(`${this.api}/admin/activity`).subscribe({
      next:  a  => { this.activity = a; this.activityLoading = false; },
      error: err => {
        this.activityLoading = false;
        this.activityError = err?.error?.message ?? 'Failed to load activity log.';
      },
    });
  }

  private loadHymns(): void {
    this.hymnsLoading = true;
    this.hymnsError   = '';
    // FIX: Use /admin/hymns to get all hymns (no pagination) for management
    this.http.get<any>(`${this.api}/hymns?per_page=999`).subscribe({
      next: res => {
        this.hymns = res.data ?? res;
        this.hymnsLoading = false;
      },
      error: err => {
        this.hymnsLoading = false;
        this.hymnsError = err?.error?.message ?? 'Failed to load hymns.';
      },
    });
  }

  private loadSermons(): void {
    this.sermonsLoading = true;
    this.sermonsError   = '';
    this.http.get<Sermon[]>(`${this.api}/sermons`).subscribe({
      next:  s  => { this.sermons = s; this.sermonsLoading = false; },
      error: err => {
        this.sermonsLoading = false;
        this.sermonsError = err?.error?.message ?? 'Failed to load sermons.';
      },
    });
  }

  //Hymn CRUD
  startEditHymn(hymn: Hymn): void {
    this.hymnEditId = hymn.id;
    this.hymnForm   = { ...hymn };
    this.hymnSuccess = '';
    this.hymnError   = '';
  }

  startAddHymn(): void {
    this.hymnEditId  = null;
    this.hymnForm    = {};
    this.hymnSuccess = '';
    this.hymnError   = '';
  }

  cancelHymnEdit(): void {
    this.hymnEditId = null;
    this.hymnForm   = {};
  }

  saveHymn(): void {
    this.hymnSaving  = true;
    this.hymnSuccess = '';
    this.hymnError   = '';

    const req = this.hymnEditId
      ? this.http.put<{ message: string; hymn: Hymn }>(
          `${this.api}/admin/hymns/${this.hymnEditId}`, this.hymnForm)
      : this.http.post<{ message: string; hymn: Hymn }>(
          `${this.api}/admin/hymns`, this.hymnForm);

    req.subscribe({
      next: res => {
        this.hymnSaving  = false;
        this.hymnSuccess = res.message ?? 'Hymn saved successfully!';
        this.hymnEditId  = null;
        this.hymnForm    = {};
        this.loadHymns();
        setTimeout(() => (this.hymnSuccess = ''), 4000);
      },
      error: err => {
        this.hymnSaving = false;
        const errors = err?.error?.errors;
        this.hymnError = errors
          ? (Object.values(errors)[0] as string)
          : err?.error?.message ?? 'Failed to save hymn.';
      },
    });
  }

  confirmDelete(type: 'hymn' | 'sermon', id: number): void {
    this.deleteConfirm = { type, id };
  }

  cancelDelete(): void {
    this.deleteConfirm = null;
  }

  executeDelete(): void {
    if (!this.deleteConfirm) return;
    const { type, id } = this.deleteConfirm;
    this.deleteConfirm = null;

    const url = type === 'hymn'
      ? `${this.api}/admin/hymns/${id}`
      : `${this.api}/admin/sermons/${id}`;

    this.http.delete<{ message: string }>(url).subscribe({
      next: () => {
        if (type === 'hymn') {
          this.hymns = this.hymns.filter(h => h.id !== id);
          this.hymnSuccess = 'Hymn deleted.';
          setTimeout(() => (this.hymnSuccess = ''), 3000);
        } else {
          this.sermons = this.sermons.filter(s => s.id !== id);
          this.sermonSuccess = 'Sermon deleted.';
          setTimeout(() => (this.sermonSuccess = ''), 3000);
        }
      },
      error: err => {
        const msg = err?.error?.message ?? 'Delete failed.';
        if (type === 'hymn')   this.hymnError   = msg;
        else                   this.sermonError  = msg;
      },
    });
  }

  // ── Sermon CRUD ───────────────────────────────────────────────

  startEditSermon(sermon: Sermon): void {
    this.sermonEditId  = sermon.id;
    this.sermonForm    = { ...sermon };
    this.sermonSuccess = '';
    this.sermonError   = '';
  }

  startAddSermon(): void {
    this.sermonEditId  = null;
    this.sermonForm    = {};
    this.sermonSuccess = '';
    this.sermonError   = '';
  }

  cancelSermonEdit(): void {
    this.sermonEditId = null;
    this.sermonForm   = {};
  }

  saveSermon(): void {
    this.sermonSaving  = true;
    this.sermonSuccess = '';
    this.sermonError   = '';

    const req = this.sermonEditId
      ? this.http.put<{ message: string; sermon: Sermon }>(
          `${this.api}/admin/sermons/${this.sermonEditId}`, this.sermonForm)
      : this.http.post<{ message: string; sermon: Sermon }>(
          `${this.api}/admin/sermons`, this.sermonForm);

    req.subscribe({
      next: res => {
        this.sermonSaving  = false;
        this.sermonSuccess = res.message ?? 'Sermon saved successfully!';
        this.sermonEditId  = null;
        this.sermonForm    = {};
        this.loadSermons();
        setTimeout(() => (this.sermonSuccess = ''), 4000);
      },
      error: err => {
        this.sermonSaving = false;
        const errors = err?.error?.errors;
        this.sermonError = errors
          ? (Object.values(errors)[0] as string)
          : err?.error?.message ?? 'Failed to save sermon.';
      },
    });
  }

  // ── Search handlers ───────────────────────────────────────────

  onUserSearch(event: Event):  void { this.userSearch  = (event.target as HTMLInputElement).value; }
  onTitheSearch(event: Event): void { this.titheSearch = (event.target as HTMLInputElement).value; }
  onHymnSearch(event: Event):  void { this.hymnSearch  = (event.target as HTMLInputElement).value; }

  statusClass(status: string): string {
    return status === 'success' ? 'badge--success'
         : status === 'failed'  ? 'badge--danger'
         : 'badge--pending';
  }
}
