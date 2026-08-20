'use client';

import React from 'react';
import { X, Folder, FileCode, CheckCircle2, Code2, Server, Layout, Database } from 'lucide-react';

interface FileStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FileStructureModal({ isOpen, onClose }: FileStructureModalProps) {
  if (!isOpen) return null;

  const fileTree = [
    {
      name: 'src/',
      type: 'folder',
      description: 'Application Root Source Code',
      children: [
        {
          name: 'app/',
          type: 'folder',
          description: 'Next.js App Router Structure',
          children: [
            {
              name: 'api/reconcile/route.ts',
              type: 'file',
              badge: 'Backend Route',
              description: 'REST API Endpoint executing O(N) HashMap reconciliation engine & returning JSON response.',
            },
            {
              name: 'layout.tsx',
              type: 'file',
              badge: 'Layout',
              description: 'Root layout with Inter font and CSS theme setup.',
            },
            {
              name: 'page.tsx',
              type: 'file',
              badge: 'Page Component',
              description: 'Main dashboard orchestration page managing Bank & Merchant forms and reconciliation response state.',
            },
            {
              name: 'globals.css',
              type: 'file',
              badge: 'Styles',
              description: 'Vanilla CSS custom properties, glassmorphism design tokens, and responsive utilities.',
            },
          ],
        },
        {
          name: 'lib/',
          type: 'folder',
          description: 'Core Engines & Business Logic',
          children: [
            {
              name: 'reconciliationEngine.ts',
              type: 'file',
              badge: 'Engine Core',
              description: 'Pure TypeScript O(N) HashMap matching algorithm categorizing transactions into 5 status categories.',
            },
          ],
        },
        {
          name: 'types/',
          type: 'folder',
          description: 'TypeScript Contracts',
          children: [
            {
              name: 'reconciliation.ts',
              type: 'file',
              badge: 'Types',
              description: 'Interfaces for Transaction, ReconciliationStatus, Summary, and API Response payloads.',
            },
          ],
        },
        {
          name: 'components/',
          type: 'folder',
          description: 'Reusable UI Components',
          children: [
            { name: 'Header.tsx', type: 'file', badge: 'UI', description: 'Top navigation bar with engine status & actions.' },
            { name: 'BankForm.tsx', type: 'file', badge: 'UI Form', description: 'Bank transaction input form with bulk import & live table.' },
            { name: 'MerchantForm.tsx', type: 'file', badge: 'UI Form', description: 'Merchant transaction input form with bulk import & live table.' },
            { name: 'ReconciliationSummaryCards.tsx', type: 'file', badge: 'Analytics', description: '6 metrics KPI cards for matched/mismatch totals.' },
            { name: 'ReconciliationChart.tsx', type: 'file', badge: 'Visualization', description: 'Recharts Pie & Bar charts for mismatch distribution.' },
            { name: 'ReconciliationTable.tsx', type: 'file', badge: 'Table', description: 'Interactive searchable/filterable results breakdown table.' },
            { name: 'TenMillionScaleModal.tsx', type: 'file', badge: 'Doc', description: 'Architectural documentation for 10 million records processing.' },
            { name: 'FileStructureModal.tsx', type: 'file', badge: 'Doc', description: 'Interactive architecture viewer.' },
          ],
        },
        {
          name: 'utils/',
          type: 'folder',
          description: 'Data Utilities',
          children: [
            {
              name: 'sampleData.ts',
              type: 'file',
              badge: 'Sample Data',
              description: 'Preset sample dataset containing T101, T102, T103, T104, T105 test cases.',
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Code2 className="text-cyan-400" size={24} />
            <h2>Next.js & TypeScript File Structure</h2>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <p className="text-sm text-slate-300">
            This application is built with <strong>Next.js App Router</strong> and <strong>TypeScript</strong>.
            The backend engine is isolated in <code className="font-mono text-cyan-300">src/lib/reconciliationEngine.ts</code> and exposed via Next.js Route Handlers at <code className="font-mono text-cyan-300">/api/reconcile</code>.
          </p>

          <div className="file-tree-container bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
            {fileTree.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Folder size={18} />
                  <span>{item.name}</span>
                  <span className="text-xs text-slate-400 font-normal">({item.description})</span>
                </div>
                <div className="pl-4 border-l border-slate-800 space-y-2">
                  {item.children?.map((sub, sIdx) => (
                    <div key={sIdx} className="space-y-1">
                      <div className="flex items-center gap-2 text-blue-400 font-semibold">
                        <Folder size={16} />
                        <span>{sub.name}</span>
                        <span className="text-xs text-slate-500 font-normal">({sub.description})</span>
                      </div>
                      <div className="pl-4 border-l border-slate-800 space-y-1.5 pt-1">
                        {sub.children?.map((file, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-slate-200">
                            <FileCode size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-100">{file.name}</span>
                                {file.badge && (
                                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                    {file.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 font-sans mt-0.5">{file.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
                <Server size={16} />
                <span>Backend Engine Architecture</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Processes inputs in single-pass linear time <code className="text-emerald-300">O(N)</code> using JavaScript <code className="text-emerald-300">Map</code>.
                Exposed at POST <code className="text-emerald-300">/api/reconcile</code> with full JSON output.
              </p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm mb-1">
                <Layout size={16} />
                <span>Frontend Dashboard Architecture</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                React Client components render dual forms for Bank & Merchant input, real-time metrics, interactive category filters, and Recharts breakdown.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-primary">
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
