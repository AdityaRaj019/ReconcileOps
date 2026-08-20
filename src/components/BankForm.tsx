'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types/reconciliation';
import { Building2, Plus, Trash2, FileText, Check, AlertCircle } from 'lucide-react';

interface BankFormProps {
  transactions: Transaction[];
  onAddTransaction: (txn: Omit<Transaction, 'id'>) => void;
  onRemoveTransaction: (id: string) => void;
  onBulkImport: (txns: Omit<Transaction, 'id'>[]) => void;
  onClearAll: () => void;
}

export default function BankForm({
  transactions,
  onAddTransaction,
  onRemoveTransaction,
  onBulkImport,
  onClearAll,
}: BankFormProps) {
  const [txnId, setTxnId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-06-01');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!txnId.trim()) {
      setErrorMsg('Transaction ID is required.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setErrorMsg('Please enter a valid non-negative amount.');
      return;
    }
    if (!date) {
      setErrorMsg('Date is required.');
      return;
    }

    onAddTransaction({
      txnId: txnId.trim().toUpperCase(),
      amount: parsedAmount,
      date,
    });

    setTxnId('');
    setAmount('');
  };

  const handleBulkParse = () => {
    setErrorMsg('');
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n');
    const parsed: Omit<Transaction, 'id'>[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.toLowerCase().startsWith('txn') || line.toLowerCase().startsWith('id')) {
        continue;
      }
      // comma, tab, or space delimited
      const parts = line.split(/[\t,]+/).map((p) => p.trim());
      if (parts.length >= 3) {
        const idVal = parts[0].toUpperCase();
        const amtVal = parseFloat(parts[1].replace('$', ''));
        const dateVal = parts[2];
        if (idVal && !isNaN(amtVal) && dateVal) {
          parsed.push({ txnId: idVal, amount: amtVal, date: dateVal });
        }
      }
    }

    if (parsed.length > 0) {
      onBulkImport(parsed);
      setBulkText('');
      setShowBulkInput(false);
    } else {
      setErrorMsg('Could not parse bulk input. Expected format: TxnID, Amount, Date (e.g. T101, 1000, 2026-06-01)');
    }
  };

  return (
    <div className="form-card bank-theme">
      <div className="form-header">
        <div className="flex items-center gap-2">
          <div className="badge-icon bank">
            <Building2 size={18} />
          </div>
          <div>
            <h2 className="form-title text-cyan-300">Bank System Ledger</h2>
            <p className="form-subtitle">Add or view bank transaction records</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBulkInput(!showBulkInput)}
            className="btn-xs-secondary"
            title="Bulk CSV / Text Paste"
          >
            <FileText size={13} />
            <span>{showBulkInput ? 'Single Form' : 'Bulk Paste'}</span>
          </button>
          {transactions.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="btn-xs-danger"
              title="Clear all bank transactions"
            >
              Clear ({transactions.length})
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="error-banner">
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {showBulkInput ? (
        <div className="space-y-3 my-3">
          <label className="block text-xs font-mono text-slate-300">
            Paste CSV / Tab-separated lines (Txn ID, Amount, Date):
          </label>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={`T101, 1000, 2026-06-01\nT102, 2000, 2026-06-01\nT103, 500, 2026-06-01\nT105, 800, 2026-06-01`}
            rows={4}
            className="form-textarea"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowBulkInput(false)}
              className="btn-secondary text-xs py-1.5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBulkParse}
              className="btn-primary text-xs py-1.5"
            >
              Import Records
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="form-grid my-3">
          <div className="input-group">
            <label className="input-label">Txn ID</label>
            <input
              type="text"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              placeholder="e.g. T101"
              className="form-input font-mono uppercase"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1000"
              className="form-input font-mono"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input font-mono"
            />
          </div>

          <div className="input-group justify-end">
            <button type="submit" className="btn-bank-add">
              <Plus size={16} />
              <span>Add Bank Entry</span>
            </button>
          </div>
        </form>
      )}

      {/* Transaction List */}
      <div className="transactions-list-container">
        <div className="list-header">
          <span>Entered Bank Records ({transactions.length})</span>
          <span className="text-slate-400 text-[11px]">Txn ID | Amount | Date</span>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">No bank transactions added yet. Use form above or click "Load Test Sample".</div>
        ) : (
          <div className="table-wrapper">
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Txn ID</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => (
                  <tr key={item.id}>
                    <td className="font-mono text-cyan-300 font-semibold">{item.txnId}</td>
                    <td className="font-mono text-emerald-400">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="font-mono text-slate-300 text-xs">{item.date}</td>
                    <td className="text-right">
                      <button
                        onClick={() => onRemoveTransaction(item.id)}
                        className="btn-icon-danger"
                        title="Delete entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
