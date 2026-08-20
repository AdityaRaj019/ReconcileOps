'use client';

import React from 'react';
import { ReconciliationSummary } from '@/types/reconciliation';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface ChartProps {
  summary: ReconciliationSummary;
}

export default function ReconciliationChart({ summary }: ChartProps) {
  const pieData = [
    { name: 'Matched', value: summary.matchedCount, color: '#10b981' },
    { name: 'Amount Mismatch', value: summary.amountMismatchCount, color: '#f43f5e' },
    { name: 'Date Mismatch', value: summary.dateMismatchCount, color: '#f59e0b' },
    { name: 'Both Mismatch', value: summary.bothMismatchCount || 0, color: '#ec4899' },
    { name: 'Only in Bank', value: summary.onlyInBankCount, color: '#06b6d4' },
    { name: 'Only in Merchant', value: summary.onlyInMerchantCount, color: '#a855f7' },
  ].filter((d) => d.value > 0);

  const barData = [
    {
      category: 'Matched',
      Count: summary.matchedCount,
    },
    {
      category: 'Amount Diff',
      Count: summary.amountMismatchCount,
    },
    {
      category: 'Date Diff',
      Count: summary.dateMismatchCount,
    },
    {
      category: 'Bank Only',
      Count: summary.onlyInBankCount,
    },
    {
      category: 'Merch Only',
      Count: summary.onlyInMerchantCount,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      {/* Pie Chart Card */}
      <div className="chart-card">
        <div className="chart-header">
          <PieIcon size={18} className="text-emerald-400" />
          <h3 className="chart-title">Status Breakdown Distribution</h3>
        </div>
        <div className="h-[240px] w-full">
          {pieData.length === 0 ? (
            <div className="empty-chart">No data to display in chart</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bar Chart Card */}
      <div className="chart-card">
        <div className="chart-header">
          <BarChart3 size={18} className="text-cyan-400" />
          <h3 className="chart-title">Category Record Volume</h3>
        </div>
        <div className="h-[240px] w-full">
          {pieData.length === 0 ? (
            <div className="empty-chart">No data to display in chart</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="Count" fill="#38bdf8" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => {
                    const colors = ['#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#a855f7'];
                    return <Cell key={`bar-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
