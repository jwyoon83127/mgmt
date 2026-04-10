'use client';

import { useState } from 'react';
import { ArchiveRow } from '@/lib/types/meeting';
import { VoteBadge, FollowUpBadge } from './StatusBadge';

interface AgendaTableProps {
  rows: ArchiveRow[];
}

export default function AgendaTable({ rows }: AgendaTableProps) {
  const [query, setQuery] = useState('');

  const filtered = rows.filter((r) =>
    r.agendaTitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      {/* 검색 */}
      <div className="px-6 py-3 border-b border-ui-high/40">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="안건 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-ui-low rounded-lg text-ui-on-surface placeholder:text-ui-variant border-none outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
        </div>
      </div>

      {/* 테이블 헤더 */}
      <div className="grid grid-cols-[60px_1fr_120px_110px_100px] px-6 py-2 text-xs font-semibold text-ui-variant uppercase tracking-wide">
        <span>회차</span>
        <span>안건</span>
        <span>승인여부</span>
        <span>이행기한</span>
        <span>진행상태</span>
      </div>

      {/* 로우 */}
      <div className="divide-y divide-transparent">
        {filtered.length === 0 ? (
          <p className="px-6 py-8 text-sm text-ui-variant text-center">검색 결과가 없습니다.</p>
        ) : (
          filtered.map((row) => (
            <div key={row.id} className="grid grid-cols-[60px_1fr_120px_110px_100px] px-6 py-3.5 items-center hover:bg-ui-low transition-colors duration-150 cursor-pointer">
              <span className="text-sm font-semibold text-ui-variant">{row.round}회</span>
              <div>
                <p className="text-sm font-medium text-ui-on-surface leading-snug">{row.agendaTitle}</p>
                <p className="text-xs text-ui-variant mt-0.5">{row.submittedAt} 상정</p>
              </div>
              <span><VoteBadge result={row.voteResult} /></span>
              <span className="text-sm text-ui-variant">{row.followUpDeadline}</span>
              <span><FollowUpBadge status={row.followUpStatus} /></span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
