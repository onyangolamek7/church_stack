import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTitheDto } from '../models/create-tithe.dto';
import { Tithe } from '../models/tithe.model';
import { environment } from '../../environments/environment';

export interface TitheResponse {
  message: string;
  tithe: {
    id: number;
    transaction_reference: string;
    amount: number;
    status: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class TitheService {
  private apiUrl = `${environment.apiUrl}/tithes`;

  constructor(private http: HttpClient) {}

  getTithes(): Observable<Tithe[]> {
    return this.http.get<Tithe[]>(this.apiUrl);
  }

  createTithe(data: CreateTitheDto): Observable<Tithe> {
    return this.http.post<Tithe>(this.apiUrl, data);
  }

}
