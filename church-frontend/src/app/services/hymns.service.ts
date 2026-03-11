import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Hymn } from '../models/hymn.model';
import { Observable, map, tap } from 'rxjs';

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
  /*private _search = signal('');

  //public readonly signals
  readonly hymns = this._hymns.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly currentPage = this._currentPage.asReadonly();
  readonly lastPage = this._lastPage.asReadonly();
  readonly search = this._search.asReadonly();*/

  /*filteredHymns = computed(() => {
    const q = this._search().toLowerCase();
    if (!q) return this._hymns();

    return this._hymns().filter(h =>
      h.title.toLowerCase().includes(q) ||
      h.number.toString().includes(q)
    );
  });*/

  /*pages = computed(() =>
    Array.from({ length: this._lastPage() }, (_, i) => i + 1)
  );*/

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

  favoriteHymn(id: number) {
    return this.http.post(`${this.api}/favorites/${id}`,{});
  }

  unfavoriteHymn(id:number) {
    return this.http.delete(`${this.api}/favorites/${id}`);
  }

  updateFavoriteState(id: number, isFavorite: boolean) {
    this.hymns.update(hymns =>
      hymns.map(h => h.id === id ? { ...h, isFavorite } : h)
    );
  }

}
