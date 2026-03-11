export interface CreateTitheDto {
  giver_name: string;
  giver_email?: string;
  giver_phone?: string;
  amount: number;
  currency: string;
  payment_method?: string;
}
