import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  private BASE_URL = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  giveTithe(payload: any): Observable<TitheResponse> {
    return this.http.post<TitheResponse>(
      `${this.BASE_URL}/tithes`,
      payload,
      { withCredentials: true }
    );
  }

}
