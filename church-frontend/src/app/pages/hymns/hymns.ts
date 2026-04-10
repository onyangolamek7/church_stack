import { HymnsService } from './../../services/hymns.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { Hymn } from '../../models/hymn.model';

@Component({
  selector: 'app-hymns',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hymns.html',
  styleUrls: ['./hymns.css']
})

export class HymnsComponent implements OnInit {
  hymnsService = inject(HymnsService);
  auth = inject(AuthService);
  private router = inject(Router);

  searchQuery = signal('');
  pages: number[] = [];

  hymns = computed(() => this.hymnsService.hymns());

  filteredHymns = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) return this.hymns();

    return this.hymns().filter(h =>
      h.title.toLowerCase().includes(query) ||
      String(h.number ?? h.id).includes(query)
    );
  });

  ngOnInit(): void {
    if (this.hymnsService.hymns().length > 0) {
      this.pages = Array.from(
        { length: this.hymnsService.lastPage() },
        (_, i) => i + 1
      );
      return;
    }
    this.loadHymns();
  }

  loadHymns(page: number = 1) {
    this.hymnsService.getHymns(page).subscribe(res => {
      this.pages = Array.from(
        { length: res.last_page },
        (_, i) => i + 1
      );
    });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.hymnsService.lastPage()) return;
    this.loadHymns(page);
  }

  openHymn(id: number): void {
    this.router.navigate(['/hymns', id]);
  }

  toggleFavorite(hymn: Hymn, event: Event): void {
    event.stopPropagation();

    if (!this.auth.isLoggedIn()) return;

    if (hymn.isFavorite) {
      this.hymnsService.unfavoriteHymn(hymn.id).subscribe();
    } else {
      this.hymnsService.favoriteHymn(hymn.id).subscribe();
    }
  }
}
