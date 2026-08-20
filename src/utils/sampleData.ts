import { Transaction } from '@/types/reconciliation';

export const INITIAL_BANK_TRANSACTIONS: Transaction[] = [
  { id: 'bank-1', txnId: 'T101', amount: 1000, date: '2026-06-01' },
  { id: 'bank-2', txnId: 'T102', amount: 2000, date: '2026-06-01' },
  { id: 'bank-3', txnId: 'T103', amount: 500, date: '2026-06-01' },
  { id: 'bank-4', txnId: 'T105', amount: 800, date: '2026-06-01' },
];

export const INITIAL_MERCHANT_TRANSACTIONS: Transaction[] = [
  { id: 'merch-1', txnId: 'T101', amount: 1000, date: '2026-06-01' },
  { id: 'merch-2', txnId: 'T102', amount: 2500, date: '2026-06-01' },
  { id: 'merch-3', txnId: 'T104', amount: 300, date: '2026-06-01' },
  { id: 'merch-4', txnId: 'T105', amount: 800, date: '2026-06-02' },
];
