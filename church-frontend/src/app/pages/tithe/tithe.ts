import {
  Component, OnInit, OnDestroy, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl, ValidationErrors,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { TitheService } from '../../services/tithe.service';
import { AuthService } from '../../services/auth';
import { MpesaInitiateResponse, PaymentStep } from '../../models/tithe.model';

// Kenyan phone validator
function kenyanPhoneValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const pattern = /^(?:\+?254|0)[17]\d{8}$/;
  return pattern.test(control.value.replace(/\s/g, ''))
    ? null
    : { invalidPhone: true };
}

@Component({
  selector: 'app-tithe-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tithe.html',
  styleUrls: ['./tithe.css'],
})
export class TithePaymentComponent implements OnInit, OnDestroy {
  private readonly titheService = inject(TitheService);
  private readonly authService  = inject(AuthService);
  private readonly fb           = inject(FormBuilder);
  private readonly destroy$     = new Subject<void>();
  private readonly stopPoll$    = new Subject<void>();

  //State signals
  readonly isAuthenticated = signal(this.authService.isLoggedIn());
  readonly currentUser     = signal<any>(this.authService.getStoredUser());
  readonly step            = signal<PaymentStep>('form');
  readonly isSubmitting    = signal(false);
  readonly errorMessage    = signal<string | null>(null);

  // Result signals
  readonly mpesaReference  = signal<string | null>(null);
  readonly receipt         = signal<string | null>(null);
  readonly paidAmount      = signal<number>(0);

  readonly quickAmounts = [500, 1000, 2000, 5000, 10000];

  //Form
  form!: FormGroup;

  //Lifecycle
  ngOnInit(): void {
    this.initForm();
    this.updateValidators();

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        console.log('Auth user received:', user);
        this.currentUser.set(user);
        this.isAuthenticated.set(!!user);
        this.updateValidators();
      });
  }

  //Form setup
  private initForm(): void {
    this.form = this.fb.group({
      amount:   [null, [Validators.required, Validators.min(1)]],
      phone:    ['', [Validators.required, kenyanPhoneValidator]],
      fullName: [''],
      email:    [''],
    });
  }

  private updateValidators(): void {
    const fullName = this.form.get('fullName')!;

    fullName.clearValidators();

    if (!this.isAuthenticated()) {
      fullName.setValidators([Validators.required, Validators.minLength(3)]);
    }

    fullName.updateValueAndValidity({ emitEvent: false });
  }

  //Quick amount
  selectQuickAmount(amount: number): void {
    this.form.get('amount')?.setValue(amount);
  }

  //Submit
  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting()) return;
    this.errorMessage.set(null);
    await this.submitMpesa();
  }

  //M-Pesa flow
  private async submitMpesa(): Promise<void> {
    this.isSubmitting.set(true);

    const user    = this.currentUser();
    const formVal = this.form.value;

    const payload: any = {
      amount: formVal.amount,
      phone:  formVal.phone,
    };

    if (!user) {
      payload.full_name = formVal.fullName;
      if (formVal.email) payload.email = formVal.email;
    }

    this.titheService.initiateMpesa(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: MpesaInitiateResponse) => {
          this.isSubmitting.set(false);
          this.mpesaReference.set(res.reference);
          this.paidAmount.set(formVal.amount);
          this.step.set('processing');
          this.startMpesaPolling(res.reference);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          console.log('Validation errors:', err.error);
          this.errorMessage.set(
            err.error?.message ?? 'Failed to initiate M-Pesa payment. Please try again.',
          );
        },
      });
  }

  private startMpesaPolling(reference: string): void {
    this.titheService.pollMpesaStatus(reference, this.stopPoll$)
      .subscribe({
        next: (status) => {
          if (status.status === 'completed') {
            this.receipt.set(status.receipt);
            this.step.set('success');
          } else {
            this.errorMessage.set('Payment was not completed. Please try again.');
            this.step.set('failed');
          }
        },
        error: () => {
          this.errorMessage.set('Could not verify payment status. Please contact support.');
          this.step.set('failed');
        },
      });
  }

  cancelMpesaPolling(): void {
    this.stopPoll$.next();
    this.step.set('form');
  }

  ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
  this.stopPoll$.next();
  this.stopPoll$.complete();
}

  reset(): void {
    this.form.reset();
    this.step.set('form');
    this.errorMessage.set(null);
    this.mpesaReference.set(null);
    this.receipt.set(null);
    this.stopPoll$.next();
  }
}
