'use client';

import React, { useState } from 'react';
import { Transaction, ReconciliationResponse } from '@/types/reconciliation';
import { INITIAL_BANK_TRANSACTIONS, INITIAL_MERCHANT_TRANSACTIONS } from '@/utils/sampleData';
import { runReconciliationEngine } from '@/lib/reconciliationEngine';
import Header from '@/components/Header';
import BankForm from '@/components/BankForm';
import MerchantForm from '@/components/MerchantForm';
import ReconciliationSummaryCards from '@/components/ReconciliationSummaryCards';
import ReconciliationChart from '@/components/ReconciliationChart';
import ReconciliationTable from '@/components/ReconciliationTable';
import { Play, RotateCcw, HardDriveDownload } from 'lucide-react';

export default function ReconcileDashboard() {
  const [bankTxns, setBankTxns] = useState<Transaction[]>(INITIAL_BANK_TRANSACTIONS);
  const [merchantTxns, setMerchantTxns] = useState<Transaction[]>(INITIAL_MERCHANT_TRANSACTIONS);
  const [reconciliationResult, setReconciliationResult] = useState<ReconciliationResponse | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [useBackendApi, setUseBackendApi] = useState(true);

  // Reconciliation ONLY runs when the user explicitly clicks the "Run Reconciliation" button
  const handleRunReconciliation = async () => {
    setIsLoading(true);
    try {
      if (useBackendApi) {
        // Send POST request to backend Next.js API route /api/reconcile
        const res = await fetch('/api/reconcile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'RECONCILE',
            bankTransactions: bankTxns,
            merchantTransactions: merchantTxns,
          }),
        });

        if (res.ok) {
          const data: ReconciliationResponse = await res.json();
          setReconciliationResult(data);
        } else {
          const clientData = runReconciliationEngine(bankTxns, merchantTxns);
          setReconciliationResult(clientData);
        }
      } else {
        const clientData = runReconciliationEngine(bankTxns, merchantTxns);
        setReconciliationResult(clientData);
      }
    } catch (err) {
      console.warn('Backend API fallback:', err);
      const clientData = runReconciliationEngine(bankTxns, merchantTxns);
      setReconciliationResult(clientData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBankTxn = (txn: Omit<Transaction, 'id'>) => {
    const newEntry: Transaction = {
      ...txn,
      id: `bank-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setBankTxns((prev) => [newEntry, ...prev]);
  };

  const handleEditBankTxn = (txn: Transaction) => {
    setBankTxns((prev) => prev.map((t) => (t.id === txn.id ? txn : t)));
  };

  const handleRemoveBankTxn = (id: string) => {
    setBankTxns((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddMerchantTxn = (txn: Omit<Transaction, 'id'>) => {
    const newEntry: Transaction = {
      ...txn,
      id: `merch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setMerchantTxns((prev) => [newEntry, ...prev]);
  };

  const handleEditMerchantTxn = (txn: Transaction) => {
    setMerchantTxns((prev) => prev.map((t) => (t.id === txn.id ? txn : t)));
  };

  const handleRemoveMerchantTxn = (id: string) => {
    setMerchantTxns((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLoadSampleData = () => {
    setBankTxns(INITIAL_BANK_TRANSACTIONS);
    setMerchantTxns(INITIAL_MERCHANT_TRANSACTIONS);
  };

  const handleResetAll = () => {
    setBankTxns([]);
    setMerchantTxns([]);
    setReconciliationResult(null);
  };

  return (
    <div className="app-container">
      <Header />

      {/* Dual Input Form Section */}
      <div className="forms-grid">
        <BankForm
          transactions={bankTxns}
          onAddTransaction={handleAddBankTxn}
          onEditTransaction={handleEditBankTxn}
          onRemoveTransaction={handleRemoveBankTxn}
          onClearAll={() => setBankTxns([])}
        />
        <MerchantForm
          transactions={merchantTxns}
          onAddTransaction={handleAddMerchantTxn}
          onEditTransaction={handleEditMerchantTxn}
          onRemoveTransaction={handleRemoveMerchantTxn}
          onClearAll={() => setMerchantTxns([])}
        />
      </div>

      {/* Reconciliation Engine Control Bar */}
      <div className="reconcile-action-bar">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSampleData}
            className="btn-secondary text-xs flex items-center gap-1.5"
            title="Load sample test cases"
          >
            <HardDriveDownload size={14} />
            <span>Load Sample</span>
          </button>
          <button onClick={handleResetAll} className="btn-secondary text-xs flex items-center gap-1.5">
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={useBackendApi}
              onChange={(e) => setUseBackendApi(e.target.checked)}
              className="accent-cyan-400"
            />
            <span>Use Backend API</span>
          </label>

          <button onClick={handleRunReconciliation} disabled={isLoading} className="reconcile-btn-large">
            <Play size={16} />
            <span>{isLoading ? 'Running...' : 'Run Reconciliation'}</span>
          </button>
        </div>
      </div>

      {/* Results View */}
      {reconciliationResult && (
        <section className="space-y-6">
          {/* Summary KPI Cards */}
          <ReconciliationSummaryCards
            summary={reconciliationResult.summary}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
          />

          {/* Visual Breakdown Charts */}
          <ReconciliationChart summary={reconciliationResult.summary} />

          {/* Itemized Filterable Results Table */}
          <ReconciliationTable
            items={reconciliationResult.results}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
          />
        </section>
      )}
    </div>
  );
}
