import { NextResponse } from 'next/server';
import { runReconciliationEngine } from '@/lib/reconciliationEngine';
import { Transaction } from '@/types/reconciliation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const bankTransactions: Transaction[] = body.bankTransactions || [];
    const merchantTransactions: Transaction[] = body.merchantTransactions || [];

    if (!Array.isArray(bankTransactions) || !Array.isArray(merchantTransactions)) {
      return NextResponse.json(
        { success: false, error: 'Invalid input format. Expected arrays of bank and merchant transactions.' },
        { status: 400 }
      );
    }

    const response = runReconciliationEngine(bankTransactions, merchantTransactions);
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to perform reconciliation' },
      { status: 500 }
    );
  }
}
