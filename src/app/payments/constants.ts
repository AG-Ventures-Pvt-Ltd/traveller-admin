export interface Payment {
  payment_id: string;
  trip_id: string;
  date_time: Date;
  status: string;
  name: string;
  mode: string;
  amount: number;
}

export const PAYMENT_STATUS = [
  { label: 'Success', value: 'success' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
];

export const PAYMENT_MODES = [
  { label: 'Credit Card', value: 'Credit Card' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Net Banking', value: 'Net Banking' },
  { label: 'Debit Card', value: 'Debit Card' },
  { label: 'Wallet', value: 'Wallet' },
];
