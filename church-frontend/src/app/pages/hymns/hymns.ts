import { HymnsService } from './../../services/hymns.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { Hymn } from '../../models/hymn.model';

/*interface PaginatedResponse {
  data: HymnData[];
  current_page: number;
  last_page: number;
  total: number;
}*/

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

  searchQuery = '';

  selectedHymn: Hymn | null = null;
  isModalOpen = false;

  pages: number[] = [];

  hymns = computed(() => this.hymnsService.hymns());

  filteredHymns = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) return this.hymns();

    return this.hymns().filter(h =>
      h.title.toLowerCase().includes(query) ||
      h.number.toString().includes(query)
    );
  });

  ngOnInit(): void {
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

  onSearch() {}

  goToPage(page: number) {
    if (page < 1 || page > this.hymnsService.lastPage()) return;

    this.loadHymns(page);
  }

  openHymn(id: number) {
    this.router.navigate(['/hymns',id]);
  }

  viewHymn(hymn: Hymn) {
    this.selectedHymn = hymn;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedHymn = null;
  }

  toggleFavorite(hymn: Hymn, event: Event) {
    event.stopPropagation();

    if (!this.auth.isLoggedIn()) return;
    if (hymn.isFavorite) {
      this.hymnsService.unfavoriteHymn(hymn.id).subscribe(() => {
        this.hymnsService.updateFavoriteState(hymn.id, false);
      });

    } else {
      this.hymnsService.favoriteHymn(hymn.id).subscribe(() => {
        this.hymnsService.updateFavoriteState(hymn.id, true);
      });
    }
  }
}

/*export class HymnsComponent implements OnInit{

  hymnsService = inject(HymnsService);
  auth = inject(AuthService);
  router = inject(Router);
  hymns: Hymn[] = []

  selectedHymn: Hymn | null = null;
  isModalOpen = false;

  searchQuery = '';

  //filteredHymns = computed(() => this.hymnsService.filteredHymns());

  pages: number[] = [];

  ngOnInit() {
    this.hymnsService.loadHymns();
  }

  loadHymns(page: number = 1) {
    this.hymnsService.loadHymns(page, this.searchQuery);
    this.pages = Array.from(
      { length: this.hymnsService.lastPage() },
      (_, i) => i + 1
    );
    };
  }

  search() {
    this.hymnsService.loadHymns(1,this.searchQuery);
  }

  goToPage(page:number) {
    this.hymnsService.loadHymns(page,this.searchQuery)
  }

  toggleFavorite(hymn: Hymn, event: Event) {
    event.stopPropagation();

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.hymnsService.toggleFavorite(hymn.id).subscribe();
  }

}*/

/*export class Hymns implements OnInit {
  hymnsService = inject(HymnsService)
  hymns: Hymn[] = [];
  filteredHymns: Hymn[] = [];
  searchTerm: string = '';
  selectedHymn: Hymn | null = null;
  isModalOpen = false;

  currentPage = 1;
  lastPage = 1;
  total = 0;

  private apiUrl = 'http://localhost:8000/api/hymns';
lyrics: any;
title: any;
hymn: any;

showFavoritesOnly: boolean = false;

favoriteIds: number[] = [];
private favoriteApiUrl = 'http://127.0.0.1:8000/api/favorites';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Load hymns from a service or API
    this.loadHymns();
    this.loadFavorites();
  }

  loadHymns(page: number = 1): void {
    this.http.get<HymnResponse>(`${this.apiUrl}?page=${page}`)
    .subscribe({
      next: (response) => {
        this.hymns = response.data;
        this.filteredHymns = response.data;

        this.currentPage = response.current_page;
        this.lastPage = response.last_page;
        this.total = response.total;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading hymns:', error);
      }
    });
  }

  openModal(hymn: Hymn): void {
    this.selectedHymn = hymn;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.selectedHymn = null;
    this.isModalOpen = false;
  }

  search(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase() || '';

    this.filteredHymns = this.hymns.filter(hymn => {
      const matchesTerm =
        hymn.title.toLowerCase().includes(term) ||
        hymn.lyrics.toLowerCase().includes(term);

        const matchesFavorite = this.showFavoritesOnly ? this.isFavorite(hymn.id) : true;

        return matchesTerm && matchesFavorite;
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.lastPage) {
      this.loadHymns(page);
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.lastPage }, (_, i) => i + 1);
  }

  //favoriteIds: number[] = [];

  //private favoriteApiUrl = 'http://localhost:8000/api/favorites';

  loadFavorites(): void {
    this.http.get<number[]>(this.favoriteApiUrl)
    .subscribe({
      next: (ids) => {
        this.favoriteIds = ids;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
      }
    });
  }

  toggleFavorite(hymn: Hymn): void {
    this.http.post(`${this.favoriteApiUrl}/${hymn.id}`,{})
    .subscribe({
      next: () => {
        this.loadFavorites();
      },
      error: (error) => {
        console.error('Error toggling favorite:', error);
      }
    });
  }

  isFavorite(id: number): boolean {
    return this.favoriteIds.includes(id);
  }

  toggleShowFavoritesOnly(): void {
    this.showFavoritesOnly = !this.showFavoritesOnly;
    this.applyFilters();
  }
}
*/
