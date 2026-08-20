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
import TenMillionScaleModal from '@/components/TenMillionScaleModal';
import FileStructureModal from '@/components/FileStructureModal';
import { Play, RotateCcw, Sparkles, HardDriveDownload, FolderTree, Database, Cpu } from 'lucide-react';

export default function ReconcileDashboard() {
  const [bankTxns, setBankTxns] = useState<Transaction[]>(INITIAL_BANK_TRANSACTIONS);
  const [merchantTxns, setMerchantTxns] = useState<Transaction[]>(INITIAL_MERCHANT_TRANSACTIONS);
  const [reconciliationResult, setReconciliationResult] = useState<ReconciliationResponse | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [isFileStructModalOpen, setIsFileStructModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useBackendApi, setUseBackendApi] = useState(true);

  // Reconciliation ONLY runs when the user explicitly clicks the "Run O(N) Reconciliation" button
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

      {/* Toolbar / Actions Subheader */}
      <div className="sub-toolbar-bar">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLoadSampleData}
            className="btn-secondary font-mono text-xs flex items-center gap-1.5"
            title="Load sample test cases (T101, T102, T103, T104, T105)"
          >
            <HardDriveDownload size={14} />
            <span>Load Sample Data</span>
          </button>

          <button
            onClick={() => setIsFileStructModalOpen(true)}
            className="btn-secondary font-mono text-xs flex items-center gap-1.5"
            title="View Project Architecture & File Structure"
          >
            <FolderTree size={14} />
            <span>Architecture & Files</span>
          </button>

          <button
            onClick={() => setIsScaleModalOpen(true)}
            className="btn-glow text-xs flex items-center gap-1.5"
            title="Verbal Follow-up Solution for 10M Records"
          >
            <Database size={14} />
            <span>10M Records Strategy</span>
          </button>
        </div>

        {reconciliationResult?.summary.executionTimeMs !== undefined && (
          <div className="performance-badge">
            <Cpu size={14} />
            <span>Engine Speed: {reconciliationResult.summary.executionTimeMs}ms</span>
            <span className="complexity-tag">O(N) HashMap</span>
          </div>
        )}
      </div>

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
