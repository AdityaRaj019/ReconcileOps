'use client';

import React, { useState } from 'react';
import { ReconciliationItem, ReconciliationStatus } from '@/types/reconciliation';
import { Search, Download, Filter, CheckCircle2, AlertTriangle, CalendarX, Building2, Store, Info } from 'lucide-react';

interface TableProps {
  items: ReconciliationItem[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export default function ReconciliationTable({ items, activeFilter, onSelectFilter }: TableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter((item) => {
    const matchesFilter = activeFilter === 'ALL' || item.status === activeFilter;
    const matchesSearch =
      item.txnId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: ReconciliationStatus, label: string) => {
    switch (status) {
      case 'MATCHED':
        return (
          <span className="badge-matched">
            <CheckCircle2 size={12} />
            <span>{label}</span>
          </span>
        );
      case 'AMOUNT_MISMATCH':
        return (
          <span className="badge-amount-mismatch">
            <AlertTriangle size={12} />
            <span>{label}</span>
          </span>
        );
      case 'DATE_MISMATCH':
        return (
          <span className="badge-date-mismatch">
            <CalendarX size={12} />
            <span>{label}</span>
          </span>
        );
      case 'ONLY_IN_BANK':
        return (
          <span className="badge-bank-only">
            <Building2 size={12} />
            <span>{label}</span>
          </span>
        );
      case 'ONLY_IN_MERCHANT':
        return (
          <span className="badge-merchant-only">
            <Store size={12} />
            <span>{label}</span>
          </span>
        );
      default:
        return (
          <span className="badge-mismatch">
            <AlertTriangle size={12} />
            <span>{label}</span>
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = ['Txn ID', 'Status', 'Bank Amount', 'Bank Date', 'Merchant Amount', 'Merchant Date', 'Notes'];
    const csvRows = [
      headers.join(','),
      ...items.map((i) =>
        [
          `"${i.txnId}"`,
          `"${i.statusLabel}"`,
          i.bankTransaction ? i.bankTransaction.amount : '',
          i.bankTransaction ? `"${i.bankTransaction.date}"` : '',
          i.merchantTransaction ? i.merchantTransaction.amount : '',
          i.merchantTransaction ? `"${i.merchantTransaction.date}"` : '',
          `"${i.notes.replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reconciliation_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (items.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `reconciliation_report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const filters: { id: string; label: string }[] = [
    { id: 'ALL', label: `All (${items.length})` },
    { id: 'MATCHED', label: 'Matched' },
    { id: 'AMOUNT_MISMATCH', label: 'Amount Mismatch' },
    { id: 'DATE_MISMATCH', label: 'Date Mismatch' },
    { id: 'ONLY_IN_BANK', label: 'Only in Bank' },
    { id: 'ONLY_IN_MERCHANT', label: 'Only in Merchant' },
  ];

  return (
    <div className="results-table-card">
      <div className="table-controls-bar">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Filter size={14} /> Filter:
          </span>
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelectFilter(f.id)}
              className={`filter-pill ${activeFilter === f.id ? 'active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="search-input-wrapper">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Txn ID..."
              className="search-input font-mono"
            />
          </div>

          <button onClick={handleExportCSV} className="btn-xs-secondary" title="Export CSV Report">
            <Download size={13} />
            <span>CSV</span>
          </button>
          <button onClick={handleExportJSON} className="btn-xs-secondary" title="Export JSON Payload">
            <Download size={13} />
            <span>JSON</span>
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th>Txn ID</th>
              <th>Status Classification</th>
              <th>Bank Ledger</th>
              <th>Merchant Ledger</th>
              <th>Difference / Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-table-row">
                  No records match the selected filter or search query.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isAmtDiff = item.status === 'AMOUNT_MISMATCH';
                const isDateDiff = item.status === 'DATE_MISMATCH';

                return (
                  <tr key={item.txnId} className={`row-${item.status.toLowerCase()}`}>
                    <td className="font-mono text-slate-100 font-bold">{item.txnId}</td>
                    <td>{getStatusBadge(item.status, item.statusLabel)}</td>
                    <td>
                      {item.bankTransaction ? (
                        <div className="font-mono text-xs">
                          <div className={isAmtDiff ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                            ${item.bankTransaction.amount.toFixed(2)}
                          </div>
                          <div className={isDateDiff ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                            {item.bankTransaction.date}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-xs">N/A (Missing)</span>
                      )}
                    </td>
                    <td>
                      {item.merchantTransaction ? (
                        <div className="font-mono text-xs">
                          <div className={isAmtDiff ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                            ${item.merchantTransaction.amount.toFixed(2)}
                          </div>
                          <div className={isDateDiff ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                            {item.merchantTransaction.date}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-xs">N/A (Missing)</span>
                      )}
                    </td>
                    <td className="text-xs text-slate-300 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Info size={13} className="text-cyan-400 shrink-0" />
                        <span>{item.notes}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
