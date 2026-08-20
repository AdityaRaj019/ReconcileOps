'use client';

import React from 'react';
import { ShieldCheck, Database, Cpu, HardDriveDownload, FolderTree, FileCode } from 'lucide-react';

interface HeaderProps {
  onLoadSample: () => void;
  onOpenScaleModal: () => void;
  onOpenFileStructureModal: () => void;
  executionTimeMs?: number;
}

export default function Header({
  onLoadSample,
  onOpenScaleModal,
  onOpenFileStructureModal,
  executionTimeMs,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-logo">
          <ShieldCheck size={28} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="brand-title">
            Reconcile<span className="accent-text">Ops</span>
          </h1>
          <p className="brand-subtitle">
            O(N) High-Performance Transaction Reconciliation Engine
          </p>
        </div>
      </div>

      <div className="header-actions">
        {executionTimeMs !== undefined && (
          <div className="performance-badge">
            <Cpu size={14} />
            <span>Engine: {executionTimeMs}ms</span>
            <span className="complexity-tag">O(N) HashMap</span>
          </div>
        )}

        <button
          onClick={onOpenFileStructureModal}
          className="btn-secondary font-mono text-xs flex items-center gap-1.5"
          title="View Project Architecture & File Structure"
        >
          <FolderTree size={16} />
          <span>File Structure</span>
        </button>

        <button
          onClick={onLoadSample}
          className="btn-secondary font-mono text-xs flex items-center gap-1.5"
          title="Load prompt test cases (T101, T102, T103, T104, T105)"
        >
          <HardDriveDownload size={16} />
          <span>Load Test Sample</span>
        </button>

        <button
          onClick={onOpenScaleModal}
          className="btn-glow flex items-center gap-1.5"
          title="Verbal Follow-up Solution for 10M Records"
        >
          <Database size={16} />
          <span>10M Records Architecture</span>
        </button>
      </div>
    </header>
  );
}
