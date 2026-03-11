import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Hymn {
  id: number;
  title: string;
  hymn_number?: string;
  lyrics_preview?: string;
}

export interface Sermon {
  id: number;
  title: string;
  preacher: string;
  description: string;
  service_date: string;
  content?: string;
  audio_url?: string;
  video_url?: string;
  status: 'upcoming' | 'completed';
  hymns: Hymn[];
}

@Injectable({
  providedIn: 'root',
})
export class SermonService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/sermons`;

  // Used on /sermons page — returns both upcoming + previous
  getAll(): Observable<{ upcoming: Sermon[]; previous: Sermon[] }> {
    return this.http.get<{ upcoming: Sermon[]; previous: Sermon[] }>(this.api);
  }

  // Used on homepage widget — single next sermon
  getNext(): Observable<{ data: Sermon | null }> {
    return this.http.get<{ data: Sermon | null }>(`${this.api}/next`);
  }

  // Single sermon detail page
  getOne(id: number): Observable<{ data: Sermon }> {
    return this.http.get<{ data: Sermon }>(`${this.api}/${id}`);
  }

}
