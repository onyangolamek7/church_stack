import { CommonModule } from '@angular/common';
import { Component, inject, Injectable, OnInit } from '@angular/core';
import { FormBuilder, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TitheService } from '../../services/tithe.service';
import { CreateTitheDto } from '../../models/create-tithe.dto';
import { Tithe } from '../../models/tithe.model';

@Component({
  selector: 'app-tithe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tithe.html',
  styleUrls: ['./tithe.css'],
})
export class TitheComponent implements OnInit {

  private fb = inject(NonNullableFormBuilder);

  tithes: Tithe[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';
  selectedAmount: number | null = null;

  titheForm = this.fb.group({
    giver_name: ['', Validators.required],
    giver_email: [''],
    giver_phone: ['', [Validators.required, Validators.pattern(/^0[17]\d{8}$/)]],
    amount: [0, [Validators.required, Validators.min(1)]],
    currency: ['KES', Validators.required],
    payment_method: ['mpesa'],
  });

  constructor(private titheService: TitheService) {}

  ngOnInit(): void {
    this.loadTithes();
  }

  loadTithes(): void {
    this.titheService.getTithes().subscribe({
      next: (res: Tithe[]) => {
        this.tithes = res;
      },
      error: (err) => {
        console.error('Error fetching tithes', err);
      }
    });
  }

  submit(): void {
    if (this.titheForm.invalid) {
      this.titheForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const payload: CreateTitheDto = this.titheForm.getRawValue();

    this.titheService.createTithe(payload).subscribe({
     next: () => {
      this.successMessage = 'Tithe submitted successfully.';
      this.titheForm.reset({
        giver_name: '',
        giver_email: '',
        giver_phone: '',
        amount: 0,
        currency: 'KES',
        payment_method: 'mpesa'
      });
      this.loadTithes();
      this.loading = false;
     },
     error: (err) => {
      console.error('Error creating tithe', err);
      this.loading = false;
     }
    });
  }

  selectAmount(amount: number): void {
      this.titheForm.patchValue({ amount});
    }
}
