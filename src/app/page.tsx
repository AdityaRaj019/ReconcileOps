'use client';

import React, { useState, useEffect } from 'react';
import { Transaction, ReconciliationResponse } from '@/types/reconciliation';
import { INITIAL_BANK_TRANSACTIONS, INITIAL_MERCHANT_TRANSACTIONS } from '@/utils/sampleData';
import { runReconciliationEngine } from '@/lib/reconciliationEngine';
import Header from '@/components/Header';
import BankForm from '@/components/BankForm';
import MerchantForm from '@/components/MerchantForm';
import ReconciliationSummaryCards from '@/components/ReconciliationSummaryCards';
import ReconciliationChart from '@/components/ReconciliationChart';
import ReconciliationTable from '@/components/ReconciliationTable';
import TenMillionScaleModal from '@/components/TenMillionScaleModal';
import FileStructureModal from '@/components/FileStructureModal';
import { Play, RotateCcw, Sparkles } from 'lucide-react';

export default function ReconcileDashboard() {
  const [bankTxns, setBankTxns] = useState<Transaction[]>(INITIAL_BANK_TRANSACTIONS);
  const [merchantTxns, setMerchantTxns] = useState<Transaction[]>(INITIAL_MERCHANT_TRANSACTIONS);
  const [reconciliationResult, setReconciliationResult] = useState<ReconciliationResponse | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [isFileStructModalOpen, setIsFileStructModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useBackendApi, setUseBackendApi] = useState(true);

  // Auto-run reconciliation engine on initial mount or dataset changes
  useEffect(() => {
    handleRunReconciliation();
  }, [bankTxns, merchantTxns]);

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
          if (data.bankTransactions) setBankTxns(data.bankTransactions);
          if (data.merchantTransactions) setMerchantTxns(data.merchantTransactions);
        } else {
          // Fallback to client-side engine if API route is unreachable
          const clientData = runReconciliationEngine(bankTxns, merchantTxns);
          setReconciliationResult(clientData);
        }
      } else {
        const clientData = runReconciliationEngine(bankTxns, merchantTxns);
        setReconciliationResult(clientData);
      }
    } catch (err) {
      console.warn('Backend API request fallback to client-side execution:', err);
      const clientData = runReconciliationEngine(bankTxns, merchantTxns);
      setReconciliationResult(clientData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBankTxn = async (txn: Omit<Transaction, 'id'>) => {
    const newEntry: Transaction = {
      ...txn,
      id: `bank-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };

    const updated = [newEntry, ...bankTxns];
    setBankTxns(updated);

    if (useBackendApi) {
      await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD',
          ledger: 'bank',
          transaction: newEntry,
          bankTransactions: updated,
          merchantTransactions: merchantTxns,
        }),
      });
    }
  };

  const handleEditBankTxn = async (txn: Transaction) => {
    const updated = bankTxns.map((t) => (t.id === txn.id ? txn : t));
    setBankTxns(updated);

    if (useBackendApi) {
      await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EDIT',
          ledger: 'bank',
          transaction: txn,
          bankTransactions: updated,
          merchantTransactions: merchantTxns,
        }),
      });
    }
  };

  const handleRemoveBankTxn = async (id: string) => {
    const targetTxn = bankTxns.find((t) => t.id === id);
    const updated = bankTxns.filter((t) => t.id !== id);
    setBankTxns(updated);

    if (useBackendApi && targetTxn) {
      await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          ledger: 'bank',
          transaction: targetTxn,
          bankTransactions: updated,
          merchantTransactions: merchantTxns,
        }),
      });
    }
  };

  const handleBulkBankImport = (items: Omit<Transaction, 'id'>[]) => {
    const newItems: Transaction[] = items.map((t, idx) => ({
      ...t,
      id: `bank-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
    }));
    setBankTxns((prev) => [...newItems, ...prev]);
  };

  const handleAddMerchantTxn = async (txn: Omit<Transaction, 'id'>) => {
    const newEntry: Transaction = {
      ...txn,
      id: `merch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };

    const updated = [newEntry, ...merchantTxns];
    setMerchantTxns(updated);

    if (useBackendApi) {
      await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD',
          ledger: 'merchant',
          transaction: newEntry,
          bankTransactions: bankTxns,
          merchantTransactions: updated,
        }),
      });
    }
  };

  const handleEditMerchantTxn = async (txn: Transaction) => {
    const updated = merchantTxns.map((t) => (t.id === txn.id ? txn : t));
    setMerchantTxns(updated);

    if (useBackendApi) {
      await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'EDIT',
          ledger: 'merchant',
          transaction: txn,
          bankTransactions: bankTxns,
          merchantTransactions: updated,
        }),
      });
    }
  };

  const handleRemoveMerchantTxn = async (id: string) => {
    const targetTxn = merchantTxns.find((t) => t.id === id);
    const updated = merchantTxns.filter((t) => t.id !== id);
    setMerchantTxns(updated);

    if (useBackendApi && targetTxn) {
      await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          ledger: 'merchant',
          transaction: targetTxn,
          bankTransactions: bankTxns,
          merchantTransactions: updated,
        }),
      });
    }
  };

  const handleBulkMerchantImport = (items: Omit<Transaction, 'id'>[]) => {
    const newItems: Transaction[] = items.map((t, idx) => ({
      ...t,
      id: `merch-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
    }));
    setMerchantTxns((prev) => [...newItems, ...prev]);
  };

  const handleLoadSampleData = async () => {
    setBankTxns(INITIAL_BANK_TRANSACTIONS);
    setMerchantTxns(INITIAL_MERCHANT_TRANSACTIONS);

    if (useBackendApi) {
      await fetch('/api/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESET_SAMPLE',
        }),
      });
    }
  };

  const handleResetAll = () => {
    setBankTxns([]);
    setMerchantTxns([]);
    setReconciliationResult(null);
  };

  return (
    <div className="app-container">
      <Header
        onLoadSample={handleLoadSampleData}
        onOpenScaleModal={() => setIsScaleModalOpen(true)}
        onOpenFileStructureModal={() => setIsFileStructModalOpen(true)}
        executionTimeMs={reconciliationResult?.summary.executionTimeMs}
      />

      {/* Dual Input Form Section */}
      <div className="forms-grid">
        <BankForm
          transactions={bankTxns}
          onAddTransaction={handleAddBankTxn}
          onEditTransaction={handleEditBankTxn}
          onRemoveTransaction={handleRemoveBankTxn}
          onBulkImport={handleBulkBankImport}
          onClearAll={() => setBankTxns([])}
        />
        <MerchantForm
          transactions={merchantTxns}
          onAddTransaction={handleAddMerchantTxn}
          onEditTransaction={handleEditMerchantTxn}
          onRemoveTransaction={handleRemoveMerchantTxn}
          onBulkImport={handleBulkMerchantImport}
          onClearAll={() => setMerchantTxns([])}
        />
      </div>

      {/* Reconciliation Engine Bar */}
      <div className="reconcile-action-bar">
        <div className="action-title-area">
          <Sparkles className="text-amber-400" size={24} />
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Engine Execution Control</h3>
            <p className="text-xs text-slate-400 font-mono">
              Status: <span className="text-emerald-400 font-semibold">O(N) HashMap Engine Ready</span> | Mode:{' '}
              {useBackendApi ? 'Backend Next.js API (/api/reconcile)' : 'In-Memory Client'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={useBackendApi}
              onChange={(e) => setUseBackendApi(e.target.checked)}
              className="accent-cyan-400"
            />
            <span>Use Backend REST API</span>
          </label>

          <button onClick={handleResetAll} className="btn-secondary text-xs py-2 flex items-center gap-1.5">
            <RotateCcw size={14} />
            <span>Reset All</span>
          </button>

          <button onClick={handleRunReconciliation} disabled={isLoading} className="reconcile-btn-large">
            <Play size={18} />
            <span>{isLoading ? 'Running Engine...' : 'Run O(N) Reconciliation'}</span>
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

      {/* Modals */}
      <TenMillionScaleModal isOpen={isScaleModalOpen} onClose={() => setIsScaleModalOpen(false)} />
      <FileStructureModal isOpen={isFileStructModalOpen} onClose={() => setIsFileStructModalOpen(false)} />
    </div>
  );
}
