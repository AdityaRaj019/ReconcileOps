import {
  Transaction,
  ReconciliationItem,
  ReconciliationResponse,
  ReconciliationStatus,
  ReconciliationSummary,
} from '@/types/reconciliation';

export function runReconciliationEngine(
  bankTxns: Transaction[],
  merchantTxns: Transaction[]
): ReconciliationResponse {
  const startTime = performance.now();

  // Step 1: Store Bank transactions in a HashMap key: txnId -> Transaction
  // O(N_bank) complexity
  const bankMap = new Map<string, Transaction>();
  for (const item of bankTxns) {
    if (item.txnId && item.txnId.trim()) {
      bankMap.set(item.txnId.trim(), item);
    }
  }

  const results: ReconciliationItem[] = [];
  const processedTxnIds = new Set<string>();

  let matchedCount = 0;
  let amountMismatchCount = 0;
  let dateMismatchCount = 0;
  let bothMismatchCount = 0;
  let onlyInMerchantCount = 0;
  let onlyInBankCount = 0;

  // Step 2: Iterate through Merchant transactions & check against HashMap
  // O(N_merchant) complexity with O(1) lookup
  for (const merchItem of merchantTxns) {
    const txnId = merchItem.txnId ? merchItem.txnId.trim() : '';
    if (!txnId) continue;

    processedTxnIds.add(txnId);
    const bankItem = bankMap.get(txnId);

    if (bankItem) {
      const amountMatches = Math.abs(bankItem.amount - merchItem.amount) < 0.001;
      const dateMatches = bankItem.date === merchItem.date;

      let status: ReconciliationStatus;
      let statusLabel: string;
      let notes: string;

      if (amountMatches && dateMatches) {
        status = 'MATCHED';
        statusLabel = 'Matched';
        notes = 'Exact match in amount and date.';
        matchedCount++;
      } else if (!amountMatches && dateMatches) {
        status = 'AMOUNT_MISMATCH';
        statusLabel = 'Amount Mismatch';
        const diff = merchItem.amount - bankItem.amount;
        notes = `Bank: $${bankItem.amount.toFixed(2)}, Merchant: $${merchItem.amount.toFixed(2)} (Diff: ${diff > 0 ? '+' : ''}$${diff.toFixed(2)})`;
        amountMismatchCount++;
      } else if (amountMatches && !dateMatches) {
        status = 'DATE_MISMATCH';
        statusLabel = 'Date Mismatch';
        notes = `Bank date: ${bankItem.date}, Merchant date: ${merchItem.date}`;
        dateMismatchCount++;
      } else {
        status = 'AMOUNT_AND_DATE_MISMATCH';
        statusLabel = 'Amount & Date Mismatch';
        notes = `Bank: $${bankItem.amount} (${bankItem.date}) vs Merchant: $${merchItem.amount} (${merchItem.date})`;
        bothMismatchCount++;
      }

      results.push({
        txnId,
        status,
        statusLabel,
        bankTransaction: {
          amount: bankItem.amount,
          date: bankItem.date,
        },
        merchantTransaction: {
          amount: merchItem.amount,
          date: merchItem.date,
        },
        amountDiff: merchItem.amount - bankItem.amount,
        dateDiff: `${bankItem.date} → ${merchItem.date}`,
        notes,
      });
    } else {
      // Present only in Merchant
      statusOnlyInMerchant(results, merchItem);
      onlyInMerchantCount++;
    }
  }

  // Step 3: Find transactions present ONLY in Bank
  // O(N_bank) pass over HashMap
  for (const [txnId, bankItem] of bankMap.entries()) {
    if (!processedTxnIds.has(txnId)) {
      results.push({
        txnId,
        status: 'ONLY_IN_BANK',
        statusLabel: 'Present only in Bank',
        bankTransaction: {
          amount: bankItem.amount,
          date: bankItem.date,
        },
        notes: `Transaction missing in Merchant ledger. Bank amount: $${bankItem.amount.toFixed(2)}`,
      });
      onlyInBankCount++;
    }
  }

  const endTime = performance.now();
  const executionTimeMs = parseFloat((endTime - startTime).toFixed(3));
  const totalUniqueTxnIds = results.length;
  const matchPercentage =
    totalUniqueTxnIds > 0 ? parseFloat(((matchedCount / totalUniqueTxnIds) * 100).toFixed(1)) : 0;

  const summary: ReconciliationSummary = {
    totalBankRecords: bankTxns.length,
    totalMerchantRecords: merchantTxns.length,
    totalUniqueTxnIds,
    matchedCount,
    amountMismatchCount,
    dateMismatchCount,
    bothMismatchCount,
    onlyInBankCount,
    onlyInMerchantCount,
    matchPercentage,
    executionTimeMs,
    algorithmComplexity: 'O(N) HashMap Single-Pass',
  };

  return {
    success: true,
    summary,
    results,
    timestamp: new Date().toISOString(),
  };
}

function statusOnlyInMerchant(results: ReconciliationItem[], merchItem: Transaction) {
  results.push({
    txnId: merchItem.txnId,
    status: 'ONLY_IN_MERCHANT',
    statusLabel: 'Present only in Merchant',
    merchantTransaction: {
      amount: merchItem.amount,
      date: merchItem.date,
    },
    notes: `Transaction missing in Bank ledger. Merchant amount: $${merchItem.amount.toFixed(2)}`,
  });
}
