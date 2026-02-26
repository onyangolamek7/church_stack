import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface HymnData {
  id: number;
  title: string;
  lyrics: string;
}

interface PaginatedResponse {
  data: HymnData[];
  current_page: number;
  last_page: number;
  total: number;
}

@Component({
  selector: 'app-hymns',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hymns.html',
  styleUrls: ['./hymns.css']
})

export class Hymns implements OnInit {
  hymns: HymnData[] = [];
  filteredHymns: HymnData[] = [];
  searchTerm: string = '';
  selectedHymn: HymnData | null = null;
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
    this.http.get<PaginatedResponse>(`${this.apiUrl}?page=${page}`)
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

  openModal(hymn: HymnData): void {
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

  toggleFavorite(hymn: HymnData): void {
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
