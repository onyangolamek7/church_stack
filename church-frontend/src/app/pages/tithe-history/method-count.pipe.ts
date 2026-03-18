import { Pipe, PipeTransform } from '@angular/core';
import { PaymentMethod, TitheHistoryItem } from '../../models/tithe.model';

//Counts the number of payments with a given payment_method.
//Usage: {{ payments | methodCount:'mpesa' }}
@Pipe({
  name: 'methodCount',
  standalone: true,
  pure: true,
})
export class MethodCountPipe implements PipeTransform {
  transform(payments: TitheHistoryItem[], method: PaymentMethod): number {
    if (!payments?.length) return 0;
    return payments.filter(p => p.payment_method === method).length;
  }
}
