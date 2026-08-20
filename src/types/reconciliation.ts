export interface Transaction {
  id: string;
  txnId: string;
  amount: number;
  date: string;
}

export type ReconciliationStatus =
  | 'MATCHED'
  | 'AMOUNT_MISMATCH'
  | 'DATE_MISMATCH'
  | 'AMOUNT_AND_DATE_MISMATCH'
  | 'ONLY_IN_BANK'
  | 'ONLY_IN_MERCHANT';

export interface ReconciliationItem {
  txnId: string;
  status: ReconciliationStatus;
  statusLabel: string;
  bankTransaction?: {
    amount: number;
    date: string;
  };
  merchantTransaction?: {
    amount: number;
    date: string;
  };
  amountDiff?: number;
  dateDiff?: string;
  notes: string;
}

export interface ReconciliationSummary {
  totalBankRecords: number;
  totalMerchantRecords: number;
  totalUniqueTxnIds: number;
  matchedCount: number;
  amountMismatchCount: number;
  dateMismatchCount: number;
  bothMismatchCount: number;
  onlyInBankCount: number;
  onlyInMerchantCount: number;
  matchPercentage: number;
  executionTimeMs: number;
  algorithmComplexity: string;
}

export interface ReconciliationResponse {
  success: boolean;
  summary: ReconciliationSummary;
  results: ReconciliationItem[];
  timestamp: string;
  bankTransactions?: Transaction[];
  merchantTransactions?: Transaction[];
  message?: string;
  error?: string;
}

export type LedgerType = 'bank' | 'merchant';

export interface EditTransactionRequest {
  action: 'ADD' | 'EDIT' | 'DELETE' | 'RECONCILE' | 'RESET_SAMPLE';
  ledger?: LedgerType;
  transaction?: Transaction;
  bankTransactions?: Transaction[];
  merchantTransactions?: Transaction[];
}
