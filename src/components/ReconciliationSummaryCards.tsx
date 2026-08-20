'use client';

import React from 'react';
import { ReconciliationSummary } from '@/types/reconciliation';
import { CheckCircle2, AlertTriangle, CalendarX, Building2, Store, Activity, Layers } from 'lucide-react';

interface SummaryCardsProps {
  summary: ReconciliationSummary;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export default function ReconciliationSummaryCards({
  summary,
  activeFilter,
  onSelectFilter,
}: SummaryCardsProps) {
  return (
    <div className="summary-cards-grid">
      {/* Total Card */}
      <div
        onClick={() => onSelectFilter('ALL')}
        className={`stat-card ${activeFilter === 'ALL' ? 'active' : ''}`}
      >
        <div className="stat-card-header">
          <span className="stat-title">Unique Txns</span>
          <div className="stat-icon-wrapper text-cyan-400 bg-cyan-950/60 border-cyan-800">
            <Layers size={18} />
          </div>
        </div>
        <div className="stat-value">{summary.totalUniqueTxnIds}</div>
        <div className="stat-footer">
          <span className="text-emerald-400 font-semibold">{summary.matchPercentage}%</span> match rate
          <span className="stat-sub font-mono">({summary.executionTimeMs}ms)</span>
        </div>
      </div>

      {/* Matched Card */}
      <div
        onClick={() => onSelectFilter('MATCHED')}
        className={`stat-card matched ${activeFilter === 'MATCHED' ? 'active' : ''}`}
      >
        <div className="stat-card-header">
          <span className="stat-title text-emerald-300">Matched</span>
          <div className="stat-icon-wrapper text-emerald-400 bg-emerald-950/60 border-emerald-800">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="stat-value text-emerald-400">{summary.matchedCount}</div>
        <div className="stat-footer text-emerald-300/80">
          Amount & date match perfectly
        </div>
      </div>

      {/* Amount Mismatch Card */}
      <div
        onClick={() => onSelectFilter('AMOUNT_MISMATCH')}
        className={`stat-card amount-mismatch ${activeFilter === 'AMOUNT_MISMATCH' ? 'active' : ''}`}
      >
        <div className="stat-card-header">
          <span className="stat-title text-rose-300">Amount Mismatch</span>
          <div className="stat-icon-wrapper text-rose-400 bg-rose-950/60 border-rose-800">
            <AlertTriangle size={18} />
          </div>
        </div>
        <div className="stat-value text-rose-400">{summary.amountMismatchCount}</div>
        <div className="stat-footer text-rose-300/80">
          Same Txn ID, differing amounts
        </div>
      </div>

      {/* Date Mismatch Card */}
      <div
        onClick={() => onSelectFilter('DATE_MISMATCH')}
        className={`stat-card date-mismatch ${activeFilter === 'DATE_MISMATCH' ? 'active' : ''}`}
      >
        <div className="stat-card-header">
          <span className="stat-title text-amber-300">Date Mismatch</span>
          <div className="stat-icon-wrapper text-amber-400 bg-amber-950/60 border-amber-800">
            <CalendarX size={18} />
          </div>
        </div>
        <div className="stat-value text-amber-400">{summary.dateMismatchCount}</div>
        <div className="stat-footer text-amber-300/80">
          Same Txn ID, differing dates
        </div>
      </div>

      {/* Only in Bank Card */}
      <div
        onClick={() => onSelectFilter('ONLY_IN_BANK')}
        className={`stat-card bank-only ${activeFilter === 'ONLY_IN_BANK' ? 'active' : ''}`}
      >
        <div className="stat-card-header">
          <span className="stat-title text-cyan-300">Only in Bank</span>
          <div className="stat-icon-wrapper text-cyan-400 bg-cyan-950/60 border-cyan-800">
            <Building2 size={18} />
          </div>
        </div>
        <div className="stat-value text-cyan-300">{summary.onlyInBankCount}</div>
        <div className="stat-footer text-cyan-300/80">
          Missing in merchant records
        </div>
      </div>

      {/* Only in Merchant Card */}
      <div
        onClick={() => onSelectFilter('ONLY_IN_MERCHANT')}
        className={`stat-card merchant-only ${activeFilter === 'ONLY_IN_MERCHANT' ? 'active' : ''}`}
      >
        <div className="stat-card-header">
          <span className="stat-title text-purple-300">Only in Merchant</span>
          <div className="stat-icon-wrapper text-purple-400 bg-purple-950/60 border-purple-800">
            <Store size={18} />
          </div>
        </div>
        <div className="stat-value text-purple-300">{summary.onlyInMerchantCount}</div>
        <div className="stat-footer text-purple-300/80">
          Missing in bank records
        </div>
      </div>
    </div>
  );
}
