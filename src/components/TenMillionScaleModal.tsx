'use client';

import React from 'react';
import { X, Database, Server, Cpu, HardDrive, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

interface ScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TenMillionScaleModal({ isOpen, onClose }: ScaleModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Database className="text-cyan-400" size={24} />
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                10 Million Records Scaling Architecture (Verbal Follow-up)
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                System Design & Algorithms for Multi-Gigabyte Reconciliation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body space-y-6">
          {/* Executive Summary */}
          <div className="p-4 bg-cyan-950/40 border border-cyan-800/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
              <Zap size={16} />
              <span>Core Scaling Challenge</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              At <strong>10 million records per file</strong> (approx. 500MB – 1.2GB per CSV file), holding all records directly in standard browser RAM or a single V8 JavaScript object heap can trigger memory limit crashes (<code className="font-mono text-cyan-300">FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory</code>).
            </p>
          </div>

          {/* Strategy Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strategy 1 */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-bold">Approach 1: Node.js Streams & Chunked HashMaps</span>
                <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Single Server
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-100">File Streaming & Chunking</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Use Node.js <code className="font-mono text-emerald-300">createReadStream()</code> with line-by-line parsing.
                Stream File A into an in-memory HashMap keying <code className="font-mono text-emerald-300">txnId</code>.
                Then stream File B record-by-record, doing an <code className="font-mono text-emerald-300">O(1)</code> lookup in Map A and writing mismatches directly to an output stream file.
              </p>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                Memory: ~400MB RAM (only Map A) | Time: O(N) ~3-5 seconds
              </div>
            </div>

            {/* Strategy 2 */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold">Approach 2: Disk-backed Key-Value (RocksDB / Redis)</span>
                <span className="px-2 py-0.5 text-[10px] rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Low RAM Memory
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-100">External Key-Value Cache</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                If RAM is constrained (e.g., micro-container with 256MB RAM), stream Bank records into an embedded disk key-value store like <strong>RocksDB</strong> or <strong>Redis Pipeline</strong>.
                Query during Merchant stream.
              </p>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                Memory: &lt; 50MB RAM | Time: O(N) with disk I/O overhead
              </div>
            </div>

            {/* Strategy 3 */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-400 font-bold">Approach 3: SQL Engine Batch JOIN (DuckDB / Postgres)</span>
                <span className="px-2 py-0.5 text-[10px] rounded bg-purple-950 text-purple-300 border border-purple-800">
                  SQL Database
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-100">Database Indexing & Full Outer Join</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Load both files into <strong>DuckDB</strong> or Postgres with indexed <code className="font-mono text-purple-300">txn_id</code> columns.
                Run a single vector-optimized query:
              </p>
              <pre className="text-[10px] font-mono bg-slate-950 text-purple-200 p-2 rounded border border-slate-800 overflow-x-auto">
{`SELECT COALESCE(b.txn_id, m.txn_id) AS txn_id,
  CASE
    WHEN b.txn_id IS NULL THEN 'ONLY_IN_MERCHANT'
    WHEN m.txn_id IS NULL THEN 'ONLY_IN_BANK'
    WHEN b.amount = m.amount AND b.date = m.date THEN 'MATCHED'
    WHEN b.amount != m.amount AND b.date = m.date THEN 'AMOUNT_MISMATCH'
    WHEN b.amount = m.amount AND b.date != m.date THEN 'DATE_MISMATCH'
    ELSE 'BOTH_MISMATCH'
  END AS status
FROM bank_txns b FULL OUTER JOIN merchant_txns m ON b.txn_id = m.txn_id;`}
              </pre>
            </div>

            {/* Strategy 4 */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400 font-bold">Approach 4: Distributed Processing (Apache Spark / Ray)</span>
                <span className="px-2 py-0.5 text-[10px] rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Multi-Node Cluster
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-100">Distributed MapReduce / Hash Partitioning</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Partition transactions across worker nodes by <code className="font-mono text-amber-300">hash(txn_id) % N_workers</code>.
                Each worker runs local HashMap matching concurrently in parallel.
              </p>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                Scale: 100M+ to Billions of transactions | Time: Scalable linear speedup
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono text-slate-300 font-bold flex items-center gap-1.5">
              <Server size={14} className="text-cyan-400" />
              Architecture Tradeoffs Matrix
            </h4>
            <div className="table-wrapper">
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Approach</th>
                    <th>Time Complexity</th>
                    <th>RAM Memory</th>
                    <th>Max Dataset Scale</th>
                    <th>Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-bold text-slate-100">In-Memory HashMap (Current)</td>
                    <td className="font-mono text-emerald-400">O(N)</td>
                    <td className="font-mono text-rose-400">~200MB per 1M</td>
                    <td className="font-mono text-slate-300">&lt; 5M records</td>
                    <td className="text-xs text-slate-300">Fast web dashboard UI</td>
                  </tr>
                  <tr>
                    <td className="font-bold text-slate-100">Node.js Stream Pipeline</td>
                    <td className="font-mono text-emerald-400">O(N)</td>
                    <td className="font-mono text-emerald-400">Fixed (~400MB)</td>
                    <td className="font-mono text-slate-300">10M - 50M records</td>
                    <td className="text-xs text-slate-300">Single backend worker node</td>
                  </tr>
                  <tr>
                    <td className="font-bold text-slate-100">DuckDB / In-Memory SQL</td>
                    <td className="font-mono text-emerald-400">O(N log N) / O(N)</td>
                    <td className="font-mono text-cyan-400">Dynamic vectorized</td>
                    <td className="font-mono text-slate-300">100M records</td>
                    <td className="text-xs text-slate-300">High performance analytics</td>
                  </tr>
                  <tr>
                    <td className="font-bold text-slate-100">Spark Distributed Cluster</td>
                    <td className="font-mono text-emerald-400">O(N/K) parallel</td>
                    <td className="font-mono text-purple-400">Cluster Distributed</td>
                    <td className="font-mono text-emerald-400">1 Billion+ records</td>
                    <td className="text-xs text-slate-300">Enterprise Big Data pipelines</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-primary">
            Got it, Close Modal
          </button>
        </div>
      </div>
    </div>
  );
}
