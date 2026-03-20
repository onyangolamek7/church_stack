import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, takeUntil, filter, take, Subject } from 'rxjs';
import { MpesaInitiateResponse, MpesaStatusResponse, MpesaTithePayload, TitheHistoryItem } from '../models/tithe.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TitheService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/tithe`;

  // ─── M-Pesa ──────────────────────────────────────────────────

  initiateMpesa(payload: MpesaTithePayload): Observable<MpesaInitiateResponse> {
    return this.http.post<MpesaInitiateResponse>(`${this.base}/mpesa/initiate`, payload);
  }

  getMpesaStatus(reference: string): Observable<MpesaStatusResponse> {
    return this.http.get<MpesaStatusResponse>(`${this.base}/mpesa/status/${reference}`);
  }

  /**
   * Poll M-Pesa status every intervalMs until terminal status or stop$ emits.
   */
  pollMpesaStatus(
    reference: string,
    stop$: Subject<void>,
    intervalMs = 4000,
  ): Observable<MpesaStatusResponse> {
    return interval(intervalMs).pipe(
      switchMap(() => this.getMpesaStatus(reference)),
      filter(res => res.status !== 'pending' && res.status !== 'processing'),
      take(1),
      takeUntil(stop$),
    );
  }

  // ─── History ─────────────────────────────────────────────────

  getHistory(page = 1): Observable<{ data: TitheHistoryItem[]; total: number }> {
    return this.http.get<{ data: TitheHistoryItem[]; total: number }>(
      `${this.base}/history`,
      { params: { page: page.toString() } },
    );
  }

  // ─── Verify ──────────────────────────────────────────────────

  verify(reference: string): Observable<any> {
    return this.http.get(`${this.base}/verify/${reference}`);
  }
}
