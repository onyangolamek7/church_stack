import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Hymn } from '../models/hymn.model';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

interface HymnResponse {
  data: Hymn[];
  current_page: number;
  last_page: number;
}

@Injectable({
  providedIn: 'root',
})
export class HymnsService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  //state signals
  hymns = signal<Hymn[]>([]);
  /*private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);*/

  currentPage = signal<number>(1);
  lastPage = signal<number>(1);

  private pendingFavorites = new Set<number>();

  getHymn(id:number) {
    return this.http.get<Hymn>(`${this.api}/hymns/${id}`);
  }

  getHymns(page: number = 1): Observable<HymnResponse> {
    return this.http
    .get<HymnResponse>(`${this.api}/hymns?page=${page}`)
    .pipe(
      tap((res) => {
        this.hymns.set(res.data);
        this.currentPage.set(res.current_page);
        this.lastPage.set(res.last_page);
      })
    );
  }

  favoriteHymn(id: number): Observable<unknown> {
    if (this.pendingFavorites.has(id)) {
      return throwError(() => new Error('Request already in flight'));
    }
    this.pendingFavorites.add(id);
    // Optimistic update — flip state NOW before the HTTP call returns
    this.updateFavoriteState(id, true);

    return this.http.post(`${this.api}/favorites/${id}`, {}).pipe(
      tap(() => this.pendingFavorites.delete(id)),
      catchError(err => {
        // Revert on failure
        this.updateFavoriteState(id, false);
        this.pendingFavorites.delete(id);
        return throwError(() => err);
      })
    );
  }

  unfavoriteHymn(id: number): Observable<unknown> {
    if (this.pendingFavorites.has(id)) {
      return throwError(() => new Error('Request already in flight'));
    }
    this.pendingFavorites.add(id);
    // Optimistic update
    this.updateFavoriteState(id, false);

    return this.http.delete(`${this.api}/favorites/${id}`).pipe(
      tap(() => this.pendingFavorites.delete(id)),
      catchError(err => {
        // Revert on failure
        this.updateFavoriteState(id, true);
        this.pendingFavorites.delete(id);
        return throwError(() => err);
      })
    );
  }

  updateFavoriteState(id: number, isFavorite: boolean): void {
    this.hymns.update(hymns =>
      hymns.map(h => h.id === id ? { ...h, isFavorite } : h)
    );
  }

  isPendingFavorite(id: number): boolean {
    return this.pendingFavorites.has(id);
  }

}
