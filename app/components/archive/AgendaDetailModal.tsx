'use client';

import { createPortal } from 'react-dom';
import { ArchiveRow } from '@/lib/types/meeting';
import { VoteBadge, FollowUpBadge } from './StatusBadge';

interface Props {
  row: ArchiveRow | null;
  onClose: () => void;
}

const voteLabel: Record<string, string> = {
  approved: '가결',
  conditional: '조건부 가결',
  review: '보류 / 재검토',
  pending: '미결',
};

const followUpLabel: Record<string, string> = {
  'in-progress': '진행중',
  delayed: '지연',
  completed: '완료',
  none: '-',
};

export default function AgendaDetailModal({ row, onClose }: Props) {
  if (!row) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-2xl bg-white rounded-3xl shadow-lg pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-8 py-6 border-b border-ui-high/40 shrink-0">
            <div className="flex items-start justify-between mb-3 gap-4">
              <div>
                <span className="text-xs font-bold text-brand-primary bg-brand-container/30 px-2.5 py-0.5 rounded-full">
                  {row.round}회차
                </span>
                <h2 className="text-xl font-bold font-display text-ui-on-surface mt-3 leading-snug">
                  {row.agendaTitle}
                </h2>
                <p className="text-xs text-ui-variant mt-1">{row.submittedAt} 상정</p>
              </div>
              <button
                onClick={onClose}
                className="text-ui-variant hover:text-ui-on-surface transition-colors cursor-pointer"
                aria-label="닫기"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            <section>
              <h3 className="text-xs font-bold text-ui-variant uppercase tracking-wider mb-2">안건 상세 내역</h3>
              <p className="text-sm text-ui-on-surface leading-relaxed">
                {row.agendaTitle}에 대한 상정 및 의결 기록입니다. 첨부된 자료와 상정 배경은 본회의록을 참조하세요.
              </p>
            </section>

            <section>
              <h3 className="text-xs font-bold text-ui-variant uppercase tracking-wider mb-2">의결 내용</h3>
              <div className="flex items-center gap-2">
                <VoteBadge result={row.voteResult} />
                <span className="text-sm text-ui-on-surface">{voteLabel[row.voteResult] ?? '미결'}</span>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-ui-variant uppercase tracking-wider mb-2">진행 여부</h3>
              <div className="flex items-center gap-3">
                <FollowUpBadge status={row.followUpStatus} />
                <span className="text-sm text-ui-on-surface">{followUpLabel[row.followUpStatus] ?? '-'}</span>
                <span className="text-xs text-ui-variant">이행기한 {row.followUpDeadline}</span>
              </div>
            </section>
          </div>

          <div className="px-8 py-4 border-t border-ui-high/40 shrink-0 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-ui-low text-ui-on-surface hover:bg-ui-high transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
