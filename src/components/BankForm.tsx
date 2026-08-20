'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types/reconciliation';
import { Building2, Plus, Trash2, AlertCircle, Edit2, Check, X } from 'lucide-react';

interface BankFormProps {
  transactions: Transaction[];
  onAddTransaction: (txn: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (txn: Transaction) => void;
  onRemoveTransaction: (id: string) => void;
  onClearAll: () => void;
}

export default function BankForm({
  transactions,
  onAddTransaction,
  onEditTransaction,
  onRemoveTransaction,
  onClearAll,
}: BankFormProps) {
  const [txnId, setTxnId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-06-01');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTxnId, setEditTxnId] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!txnId.trim()) {
      setErrorMsg('Transaction ID is required.');
      return;
    }
    const formattedTxnId = txnId.trim().toUpperCase();

    // Check duplicate ID in existing bank list
    const isDuplicate = transactions.some((t) => t.txnId.toUpperCase() === formattedTxnId);
    if (isDuplicate) {
      setErrorMsg(`Transaction ID "${formattedTxnId}" already exists in Bank ledger.`);
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
      txnId: formattedTxnId,
      amount: parsedAmount,
      date,
    });

    setTxnId('');
    setAmount('');
  };

  const handleStartEdit = (item: Transaction) => {
    setEditingId(item.id);
    setEditTxnId(item.txnId);
    setEditAmount(item.amount.toString());
    setEditDate(item.date);
    setErrorMsg('');
  };

  const handleSaveEdit = (id: string) => {
    setErrorMsg('');
    if (!editTxnId.trim()) {
      setErrorMsg('Transaction ID cannot be empty.');
      return;
    }
    const formattedTxnId = editTxnId.trim().toUpperCase();

    // Check if new ID collides with ANOTHER record in bank list
    const isDuplicate = transactions.some(
      (t) => t.id !== id && t.txnId.toUpperCase() === formattedTxnId
    );
    if (isDuplicate) {
      setErrorMsg(`Transaction ID "${formattedTxnId}" is already used by another Bank entry.`);
      return;
    }

    const parsedAmount = parseFloat(editAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setErrorMsg('Please enter a valid non-negative amount.');
      return;
    }
    if (!editDate) {
      setErrorMsg('Date is required.');
      return;
    }

    onEditTransaction({
      id,
      txnId: formattedTxnId,
      amount: parsedAmount,
      date: editDate,
    });

    setEditingId(null);
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
            <p className="form-subtitle">Add, edit, or replace bank records</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Transaction List with Edit Support */}
      <div className="transactions-list-container">
        <div className="list-header">
          <span>Entered Bank Records ({transactions.length})</span>
          <span className="text-slate-400 text-[11px]">Actions: Edit / Delete</span>
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
                {transactions.map((item) => {
                  const isEditing = editingId === item.id;
                  if (isEditing) {
                    return (
                      <tr key={item.id} className="bg-cyan-950/40">
                        <td>
                          <input
                            type="text"
                            value={editTxnId}
                            onChange={(e) => setEditTxnId(e.target.value)}
                            className="form-input font-mono uppercase text-xs py-1"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="form-input font-mono text-xs py-1"
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="form-input font-mono text-xs py-1"
                          />
                        </td>
                        <td className="text-right whitespace-nowrap">
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="btn-xs-secondary bg-emerald-950 text-emerald-300 border-emerald-800 mr-1"
                            title="Save changes"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="btn-xs-secondary bg-slate-800 text-slate-400"
                            title="Cancel editing"
                          >
                            <X size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={item.id}>
                      <td className="font-mono text-cyan-300 font-semibold">{item.txnId}</td>
                      <td className="font-mono text-emerald-400">
                        ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="font-mono text-slate-300 text-xs">{item.date}</td>
                      <td className="text-right whitespace-nowrap">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="btn-xs-secondary mr-1"
                          title="Edit transaction details"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => onRemoveTransaction(item.id)}
                          className="btn-icon-danger"
                          title="Delete entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
