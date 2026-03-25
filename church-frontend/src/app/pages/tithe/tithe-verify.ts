import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TitheService } from '../../services/tithe.service';

@Component({
  selector: 'app-tithe-verify',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="verify-page">
      @if (loading()) {
        <div class="verify-loading">
          <span class="spinner-lg"></span>
          <p>Verifying your payment…</p>
        </div>
      }

      @if (!loading() && payment()) {
        <div class="verify-card" [class.success]="payment()?.status === 'completed'"
                                 [class.failed]="payment()?.status === 'failed'">
          @if (payment()?.status === 'completed') {
            <div class="v-icon">✅</div>
            <h1>Payment Confirmed</h1>
            <p>Thank you, <strong>{{ payment()?.payer_name }}</strong>. Your tithe has been received.</p>
          } @else {
            <div class="v-icon">❌</div>
            <h1>Payment {{ payment()?.status | titlecase }}</h1>
            <p>Reference: {{ payment()?.reference }}</p>
          }

          <div class="v-details">
            <div class="v-row"><span>Amount</span><span>{{ payment()?.currency }} {{ payment()?.amount | number:'1.2-2' }}</span></div>
            <div class="v-row"><span>Method</span><span>{{ payment()?.payment_method === 'mpesa' ? 'M-Pesa' : 'Card' }}</span></div>
            <div class="v-row"><span>Reference</span><span class="mono">{{ payment()?.reference }}</span></div>
            @if (payment()?.paid_at) {
              <div class="v-row"><span>Date</span><span>{{ payment()?.paid_at | date:'medium' }}</span></div>
            }
          </div>

          <a routerLink="/tithe" class="back-btn">Give Again</a>
        </div>
      }

      @if (!loading() && error()) {
        <div class="verify-card failed">
          <div class="v-icon">⚠️</div>
          <h1>Could Not Verify</h1>
          <p>{{ error() }}</p>
          <a routerLink="/tithe" class="back-btn">Go Back</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .verify-page { min-height: 100vh; background: #0f1923; display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; font-family: 'Cormorant Garamond', serif; }
    .verify-loading { text-align: center; color: #8a9ab0; font-family: 'DM Sans', sans-serif; }
    .spinner-lg { display: inline-block; width: 40px; height: 40px; border: 3px solid rgba(201,150,12,.2); border-top-color: #c9960c; border-radius: 50%; animation: spin .8s linear infinite; margin-bottom: 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .verify-card { background: #1c2b3a; border: 1px solid rgba(201,150,12,.25); border-radius: 14px; padding: 2.5rem 2rem; max-width: 440px; width: 100%; text-align: center; }
    .verify-card.success { border-color: rgba(34,197,94,.3); }
    .verify-card.failed  { border-color: rgba(239,68,68,.3); }
    .v-icon { font-size: 3rem; margin-bottom: .75rem; }
    h1 { color: #f5d060; font-size: 1.8rem; margin: 0 0 .5rem; }
    p  { color: #8a9ab0; font-family: 'DM Sans', sans-serif; font-size: .95rem; margin-bottom: 1.5rem; }
    .v-details { background: #162130; border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1.75rem; text-align: left; }
    .v-row { display: flex; justify-content: space-between; padding: .45rem 0; border-bottom: 1px solid rgba(255,255,255,.04); font-family: 'DM Sans', sans-serif; font-size: .88rem; color: #8a9ab0; }
    .v-row span:last-child { color: #e8e0d0; font-weight: 500; }
    .mono { font-family: monospace; font-size: .82rem; }
    .back-btn { display: inline-block; background: linear-gradient(135deg, #9a6f00, #c9960c); color: #1a1000; font-family: 'DM Sans', sans-serif; font-weight: 700; border-radius: 8px; padding: .85rem 2rem; text-decoration: none; }
  `],
})
export class TitheVerifyComponent implements OnInit {
  private readonly route        = inject(ActivatedRoute);
  private readonly titheService = inject(TitheService);

  readonly loading = signal(true);
  readonly payment = signal<any>(null);
  readonly error   = signal<string | null>(null);

  ngOnInit(): void {
    const ref = this.route.snapshot.paramMap.get('reference')!;
    this.titheService.verify(ref).subscribe({
      next: (data) => { this.payment.set(data); this.loading.set(false); },
      error: ()     => { this.error.set('Payment not found or could not be retrieved.'); this.loading.set(false); },
    });
  }
}
