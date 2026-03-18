/*export interface Tithe {
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
}*/


export type PaymentMethod = 'mpesa';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type PaymentStep   = 'form' | 'processing' | 'success' | 'failed';

// ─── Request payload ────────────────────────────────────────────

export interface MpesaTithePayload {
  amount:     number;
  phone:      string;
  full_name?: string;  // required for guest users
  email?:     string;  // optional for guest users
}

// ─── Response shapes ────────────────────────────────────────────

export interface MpesaInitiateResponse {
  success:    boolean;
  message:    string;
  reference:  string;
  payment_id: number;
}

export interface MpesaStatusResponse {
  status:    PaymentStatus;
  reference: string;
  paid_at:   string | null;
  receipt:   string | null;
}

export interface TitheVerifyResponse {
  reference:      string;
  status:         PaymentStatus;
  amount:         number;
  currency:       string;
  payment_method: PaymentMethod;
  paid_at:        string | null;
  payer_name:     string;
}

export interface TitheHistoryItem {
  id:             number;
  amount:         number;
  currency:       string;
  payment_method: PaymentMethod;
  status:         PaymentStatus;
  reference:      string;
  paid_at:        string | null;
  created_at:     string;
}
