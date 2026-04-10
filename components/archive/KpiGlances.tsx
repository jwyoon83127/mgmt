'use client';

import { useState } from 'react';
import { KpiData } from '@/lib/types/meeting';

interface KpiGlancesProps {
  data: KpiData;
}

export default function KpiGlances({ data }: KpiGlancesProps) {
  const [year, setYear] = useState(2026);

  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-ui-high/40">
      {/* Year select */}
      <div className="relative">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="appearance-none pr-7 pl-3 py-1.5 text-sm font-semibold bg-ui-low rounded-lg text-ui-on-surface border-none outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
        <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ui-variant pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {/* KPI 수치 */}
      <div className="flex items-center gap-10">
        <KpiItem label="총 안건" value={data.total} variant="default" />
        <div className="w-px h-8 bg-ui-high" />
        <KpiItem label="진행중" value={data.inProgress} variant="progress" />
        <KpiItem label="딜레이" value={data.delayed} variant="error" />
        <KpiItem label="완료" value={data.completed} variant="success" />
      </div>
    </div>
  );
}

function KpiItem({ label, value, variant }: { label: string; value: number; variant: 'default' | 'progress' | 'error' | 'success' }) {
  const valueClass = {
    default: 'text-ui-on-surface',
    progress: 'text-brand-primary',
    error: 'text-status-error',
    success: 'text-ui-variant',
  }[variant];

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className={`text-3xl font-bold font-display ${valueClass}`}>{value}</span>
      <span className="text-xs text-ui-variant">{label}</span>
    </div>
  );
}
