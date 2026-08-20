'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-logo">
          <ShieldCheck size={26} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="brand-title">
            Reconcile<span className="accent-text">Ops</span>
          </h1>
          <p className="brand-subtitle">
            Transaction Reconciliation Engine
          </p>
        </div>
      </div>
    </header>
  );
}
