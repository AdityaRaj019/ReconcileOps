import { NextResponse } from 'next/server';
import { runReconciliationEngine } from '@/lib/reconciliationEngine';
import { Transaction, EditTransactionRequest } from '@/types/reconciliation';
import { INITIAL_BANK_TRANSACTIONS, INITIAL_MERCHANT_TRANSACTIONS } from '@/utils/sampleData';

// In-memory store initialized with sample data
let serverBankStore: Transaction[] = [...INITIAL_BANK_TRANSACTIONS];
let serverMerchantStore: Transaction[] = [...INITIAL_MERCHANT_TRANSACTIONS];

export async function GET() {
  // GET endpoint returns the current stored transactions and reconciliation analysis
  const response = runReconciliationEngine(serverBankStore, serverMerchantStore);
  return NextResponse.json({
    ...response,
    bankTransactions: serverBankStore,
    merchantTransactions: serverMerchantStore,
  });
}

export async function POST(request: Request) {
  try {
    const body: EditTransactionRequest & { bankTransactions?: Transaction[]; merchantTransactions?: Transaction[] } =
      await request.json();

    // 1. Direct Array Reconciliation Payload
    if (body.bankTransactions && body.merchantTransactions && !body.action) {
      serverBankStore = body.bankTransactions;
      serverMerchantStore = body.merchantTransactions;
      const response = runReconciliationEngine(serverBankStore, serverMerchantStore);
      return NextResponse.json({
        ...response,
        bankTransactions: serverBankStore,
        merchantTransactions: serverMerchantStore,
      });
    }

    const { action, ledger, transaction } = body;

    // Use passed arrays or fallback to server store
    let currentBank = body.bankTransactions ? [...body.bankTransactions] : [...serverBankStore];
    let currentMerchant = body.merchantTransactions ? [...body.merchantTransactions] : [...serverMerchantStore];

    switch (action) {
      case 'ADD': {
        if (!ledger || !transaction || !transaction.txnId) {
          return NextResponse.json(
            { success: false, error: 'Ledger type and valid transaction are required for ADD action.' },
            { status: 400 }
          );
        }

        const targetArray = ledger === 'bank' ? currentBank : currentMerchant;
        const formattedTxnId = transaction.txnId.trim().toUpperCase();

        // Check duplicate Txn ID in the target ledger
        const isDuplicate = targetArray.some((t) => t.txnId.toUpperCase() === formattedTxnId);
        if (isDuplicate) {
          return NextResponse.json(
            {
              success: false,
              error: `Transaction ID "${formattedTxnId}" already exists in the ${ledger} ledger. Please use a unique ID.`,
            },
            { status: 400 }
          );
        }

        const newEntry: Transaction = {
          ...transaction,
          id: transaction.id || `${ledger}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          txnId: formattedTxnId,
        };

        if (ledger === 'bank') {
          currentBank = [newEntry, ...currentBank];
        } else {
          currentMerchant = [newEntry, ...currentMerchant];
        }
        break;
      }

      case 'EDIT': {
        if (!ledger || !transaction || !transaction.id) {
          return NextResponse.json(
            { success: false, error: 'Ledger type and valid transaction ID are required for EDIT action.' },
            { status: 400 }
          );
        }

        const targetArray = ledger === 'bank' ? currentBank : currentMerchant;
        const formattedTxnId = transaction.txnId.trim().toUpperCase();

        // Ensure new Txn ID does not collide with ANOTHER record in the same ledger
        const isDuplicate = targetArray.some(
          (t) => t.id !== transaction.id && t.txnId.toUpperCase() === formattedTxnId
        );
        if (isDuplicate) {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot update. Transaction ID "${formattedTxnId}" is already assigned to another entry in the ${ledger} ledger.`,
            },
            { status: 400 }
          );
        }

        const updatedArray = targetArray.map((t) =>
          t.id === transaction.id
            ? { ...t, txnId: formattedTxnId, amount: Number(transaction.amount), date: transaction.date }
            : t
        );

        if (ledger === 'bank') {
          currentBank = updatedArray;
        } else {
          currentMerchant = updatedArray;
        }
        break;
      }

      case 'DELETE': {
        if (!ledger || !transaction?.id) {
          return NextResponse.json(
            { success: false, error: 'Ledger type and transaction ID are required for DELETE action.' },
            { status: 400 }
          );
        }
        if (ledger === 'bank') {
          currentBank = currentBank.filter((t) => t.id !== transaction.id);
        } else {
          currentMerchant = currentMerchant.filter((t) => t.id !== transaction.id);
        }
        break;
      }

      case 'RESET_SAMPLE': {
        currentBank = [...INITIAL_BANK_TRANSACTIONS];
        currentMerchant = [...INITIAL_MERCHANT_TRANSACTIONS];
        break;
      }

      case 'RECONCILE':
      default:
        // Run engine on current state
        break;
    }

    // Persist to server store
    serverBankStore = currentBank;
    serverMerchantStore = currentMerchant;

    // Run reconciliation engine
    const reconciliation = runReconciliationEngine(serverBankStore, serverMerchantStore);

    return NextResponse.json({
      ...reconciliation,
      bankTransactions: serverBankStore,
      merchantTransactions: serverMerchantStore,
      message: action ? `Action ${action} executed successfully` : undefined,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process transaction request' },
      { status: 500 }
    );
  }
}
