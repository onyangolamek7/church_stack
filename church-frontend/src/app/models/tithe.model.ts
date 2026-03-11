export interface Tithe {
  id?: number;
  user_id?: number | null;

  giver_name: string;
  giver_email?: string | null;
  giver_phone?: string | null;

  amount: number;
  currency: string;
  payment_method?: string | null;

  transaction_reference?: string;
  status?: 'pending' | 'completed' | 'failed';

  created_at?: string;
  updated_at?: string;
}
