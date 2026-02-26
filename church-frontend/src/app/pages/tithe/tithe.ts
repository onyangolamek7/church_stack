import { CommonModule } from '@angular/common';
import { Component, inject, Injectable } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TitheService } from '../../services/tithe.service';

@Component({
  selector: 'app-tithe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tithe.html',
  styleUrls: ['./tithe.css'],
})
export class Tithe {

  private fb = inject(FormBuilder);
  private titheService = inject(TitheService);

  loading = false;
  successMessage = '';
  errorMessage = '';
  selectedAmount: number | null = null;

  titheForm = this.fb.group({
    giver_name: ['', Validators.required],
    giver_email: ['', [Validators.required]],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    payment_method: ['', Validators.required]
  });

  mpesaForm = this.fb.group({
    giver_phone: ['', [Validators.required, Validators.pattern(/^0[17]\d{8}$/)]],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    notes: ['']
  });

  selectAmount(amount: number): void {
    this.selectedAmount = amount;
    this.titheForm.patchValue({ amount });
  }

  submitTithe(): void {
    if (this.titheForm.invalid) return;

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.titheService.giveTithe(this.titheForm.getRawValue())
    .subscribe({
      next: (res: any) => {
        this.successMessage =
        `${res.message} - Ref: ${res.tithe.transaction_reference}`;
        this.titheForm.reset();
        this.selectedAmount = null;
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage =
        err?.error?.message || 'Something went wrong';
        this.loading = false;
      }
    });
  }

  submitMpesa(): void {
    if (this.mpesaForm.invalid) return;

    const payload = {
      ...this.mpesaForm.value,
      payment_method: 'mpesa',
      currency: 'KES',
      giver_name: 'MPesa Donor'
    };

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.titheService.giveTithe(payload)
      .subscribe({
        next: (res: any) => {
          this.successMessage =
            `MPesa initiated — Ref: ${res.tithe.transaction_reference}. Check phone.`;
          this.mpesaForm.reset();
          this.loading = false;
          },
        error: (err: any) => {
          this.errorMessage =
            err?.error?.message || 'MPesa failed';
          this.loading = false;
        }
      });
  }
}
