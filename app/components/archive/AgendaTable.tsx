'use client';

import { useState } from 'react';
import { ArchiveRow } from '@/lib/types/meeting';
import { VoteBadge, FollowUpBadge } from './StatusBadge';
import AgendaDetailModal from './AgendaDetailModal';

interface AgendaTableProps {
  rows: ArchiveRow[];
}

export default function AgendaTable({ rows }: AgendaTableProps) {
  const [query, setQuery] = useState('');
  const [detailRow, setDetailRow] = useState<ArchiveRow | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const filtered = rows.filter((r) =>
    r.agendaTitle.toLowerCase().includes(query.toLowerCase())
  );

  const handleShare = async (row: ArchiveRow) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/?agenda=${encodeURIComponent(row.id)}`;
    const text = `[${row.round}회차] ${row.agendaTitle}\n이행기한: ${row.followUpDeadline}\n${url}`;
    try {
      const nav = typeof navigator !== 'undefined' ? (navigator as Navigator & { share?: (data: { title?: string; text?: string; url?: string }) => Promise<void> }) : null;
      if (nav?.share) {
        await nav.share({ title: row.agendaTitle, text, url });
      } else if (nav?.clipboard) {
        await nav.clipboard.writeText(text);
      }
      setShareToast('안건 링크가 복사되었습니다');
    } catch {
      setShareToast('공유를 취소했습니다');
    }
    setTimeout(() => setShareToast(null), 2200);
  };

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
      <div className="grid grid-cols-[60px_1fr_120px_110px_100px_60px] px-6 py-2 text-xs font-semibold text-ui-variant uppercase tracking-wide">
        <span>회차</span>
        <span>안건</span>
        <span>승인여부</span>
        <span>이행기한</span>
        <span>진행상태</span>
        <span className="text-right">공유</span>
      </div>

      {/* 로우 */}
      <div className="divide-y divide-transparent">
        {filtered.length === 0 ? (
          <p className="px-6 py-8 text-sm text-ui-variant text-center">검색 결과가 없습니다.</p>
        ) : (
          filtered.map((row) => (
            <div key={row.id} className="grid grid-cols-[60px_1fr_120px_110px_100px_60px] px-6 py-3.5 items-center hover:bg-ui-low transition-colors duration-150">
              <span className="text-sm font-semibold text-ui-variant">{row.round}회</span>
              <div>
                <button
                  type="button"
                  onClick={() => setDetailRow(row)}
                  className="text-left text-sm font-medium text-ui-on-surface leading-snug hover:text-brand-primary hover:underline underline-offset-2 cursor-pointer"
                  title="안건 상세 보기"
                >
                  {row.agendaTitle}
                </button>
                <p className="text-xs text-ui-variant mt-0.5">{row.submittedAt} 상정</p>
              </div>
              <span><VoteBadge result={row.voteResult} /></span>
              <span className="text-sm text-ui-variant">{row.followUpDeadline}</span>
              <span><FollowUpBadge status={row.followUpStatus} /></span>
              <span className="flex justify-end">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleShare(row); }}
                  className="p-1.5 rounded-lg text-ui-variant hover:text-brand-primary hover:bg-brand-container/30 transition-colors cursor-pointer"
                  title="안건 공유 (링크 복사)"
                  aria-label="안건 공유"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
                  </svg>
                </button>
              </span>
            </div>
          ))
        )}
      </div>

      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-full bg-ui-on-surface text-white text-xs font-medium shadow-lg">
          {shareToast}
        </div>
      )}

      <AgendaDetailModal row={detailRow} onClose={() => setDetailRow(null)} />
    </div>
  );
}
