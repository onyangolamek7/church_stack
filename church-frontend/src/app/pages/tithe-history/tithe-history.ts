import {
  Component, OnInit, OnDestroy, inject, signal, computed,
} from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe} from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { TitheService } from '../../services/tithe.service';
import { PaymentMethod, PaymentStatus, TitheHistoryItem } from '../../models/tithe.model';
import { MethodCountPipe } from './method-count.pipe';

@Component({
  selector: 'app-tithe-history',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe, DatePipe, MethodCountPipe],
  templateUrl: './tithe-history.html',
  styleUrls: ['./tithe-history.css'],
})
export class TitheHistoryComponent implements OnInit, OnDestroy {
  private readonly titheService = inject(TitheService);
  private readonly destroy$ = new Subject<void>();

  //signal state
  readonly loading      = signal(true);
  readonly error        = signal<string | null>(null);
  readonly payments     = signal<TitheHistoryItem[]>([]);
  readonly currentPage  = signal(1);
  readonly totalItems   = signal(0);
  readonly pageSize     = 15;

  //Filter / sort
  readonly activeFilter = signal<'all' | PaymentMethod>('all');
  readonly activeStatus = signal<'all' | PaymentStatus>('all');

  //Computed
  readonly totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize));

  readonly filteredPayments = computed(() => {
    let list = this.payments();
    if (this.activeFilter() !== 'all') {
      list = list.filter(p => p.payment_method === this.activeFilter());
    }
    if (this.activeStatus() !== 'all') {
      list = list.filter(p => p.status === this.activeStatus());
    }
    return list;
  });

  readonly totalGiven = computed(() =>
    this.payments()
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount), 0),
  );

  readonly completedCount = computed(() =>
    this.payments().filter(p => p.status === 'completed').length,
  );

  readonly hasMpesa = computed(() =>
    this.payments().some(p => p.payment_method === 'mpesa'),
  );

  //Lifecycle
  ngOnInit(): void {
    this.loadPage(1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //Data loading
  loadPage(page: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.activeFilter.set('all');
    this.activeStatus.set('all');

    this.titheService.getHistory(page)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.payments.set(res.data);
          this.totalItems.set(res.total);
          this.currentPage.set(page);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Could not load your tithe history. Please try again.');
          this.loading.set(false);
        },
      });
  }

  //Filters
  setMethodFilter(filter: 'all' | PaymentMethod): void {
    this.activeFilter.set(filter);
  }

  setStatusFilter(status: 'all' | PaymentStatus): void {
    this.activeStatus.set(status);
  }

  //Pagination

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.loadPage(page);
  }

  get pageNumbers(): number[] {
    const total  = this.totalPages();
    const cur    = this.currentPage();
    const delta  = 2;
    const range: number[] = [];

    for (let i = Math.max(1, cur - delta); i <= Math.min(total, cur + delta); i++) {
      range.push(i);
    }
    return range;
  }

  statusClass(status: PaymentStatus): string {
    const map: Record<PaymentStatus, string> = {
      completed:  'status--completed',
      pending:    'status--pending',
      processing: 'status--processing',
      failed:     'status--failed',
      cancelled:  'status--cancelled',
    };
    return map[status] ?? '';
  }

  statusLabel(status: PaymentStatus): string {
    const map: Record<PaymentStatus, string> = {
      completed:  '✓ Completed',
      pending:    '⏳ Pending',
      processing: '⟳ Processing',
      failed:     '✗ Failed',
      cancelled:  '— Cancelled',
    };
    return map[status] ?? status;
  }

  methodLabel(method: PaymentMethod): string {
    return method === 'mpesa' ? 'M-Pesa' : 'Card';
  }

  currencyFormat(item: TitheHistoryItem): string {
    return item.currency === 'USD'
      ? `$${Number(item.amount).toFixed(2)}`
      : `KES ${Number(item.amount).toLocaleString()}`;
  }

  trackById(_: number, item: TitheHistoryItem): number {
    return item.id;
  }
}
