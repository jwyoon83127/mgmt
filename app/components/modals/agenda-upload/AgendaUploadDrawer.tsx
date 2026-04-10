'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { useAgendaStore } from '@/lib/store/agendaStore';
import { getRoundWithOffset } from '@/lib/utils/meetingRound';
import AgendaItemForm, { AgendaFormData } from './AgendaItemForm';

const emptyItem = (): AgendaFormData => ({ title: '', description: '', fileName: undefined });

type Toast = { type: 'error' | 'success'; lines: string[] };

function formatDate(d: Date) {
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function AgendaUploadDrawer() {
  const { agendaDrawerOpen, closeAgendaDrawer } = useUIStore();
  const { addAgendas } = useAgendaStore();
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState<AgendaFormData[]>([emptyItem()]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (agendaDrawerOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [agendaDrawerOpen]);

  // 토스트 자동 제거 (success만)
  useEffect(() => {
    if (toast?.type === 'success') {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));
  const updateItem = (index: number, data: AgendaFormData) =>
    setItems((prev) => prev.map((item, i) => (i === index ? data : item)));

  const handleClose = () => {
    closeAgendaDrawer();
    setTimeout(() => {
      setItems([emptyItem()]);
      setToast(null);
    }, 300);
  };

  const handleSubmit = () => {
    // 유효성 검사
    const errorLines: string[] = [];

    if (items.length === 0) {
      errorLines.push('• 최소 1개 이상의 안건을 등록해주세요');
    }

    items.forEach((item, i) => {
      if (!item.title.trim()) {
        errorLines.push(`• ${i + 1}번 안건: 제목을 입력해주세요`);
      } else if (item.title.trim().length < 3) {
        errorLines.push(`• ${i + 1}번 안건: 제목은 3자 이상이어야 합니다`);
      }

      if (item.description && item.description.trim().length > 500) {
        errorLines.push(`• ${i + 1}번 안건: 설명은 500자 이하여야 합니다`);
      }
    });

    if (errorLines.length > 0) {
      setToast({ type: 'error', lines: errorLines });
      return;
    }

    setSubmitting(true);
    const now = new Date();
    const round = getRoundWithOffset(now.getFullYear());
    const submittedAt = formatDate(now);

    const newRows = items.map((item, i) => ({
      id: `submitted-${Date.now()}-${i}`,
      round,
      agendaTitle: item.title.trim(),
      submittedAt,
      voteResult: 'pending' as const,
      followUpDeadline: '-',
      followUpStatus: 'none' as const,
    }));

    addAgendas(newRows);
    setSubmitting(false);
    setToast({ type: 'success', lines: [`${newRows.length}개 안건이 등록되었습니다.`] });

    // 잠시 후 드로어 닫기
    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  if (!agendaDrawerOpen) return null;

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* 드로어 */}
      <div
        className={`drawer-panel w-full md:w-[600px] transform transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ui-high/40 shrink-0">
          <div>
            <h2 className="text-base font-bold font-display text-ui-on-surface">안건 업로드</h2>
            <p className="text-xs text-ui-variant mt-0.5">안건을 등록하고 의결 문서를 업로드합니다</p>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-ui-low text-ui-variant hover:text-ui-on-surface transition-colors cursor-pointer">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 토스트 배너 */}
        {toast && (
          <div
            className={`mx-6 mt-4 rounded-xl px-4 py-3 flex items-start gap-3 text-sm font-medium transition-all ${
              toast.type === 'error'
                ? 'bg-[#ffdad6] text-[#410002] border border-[#ffdad6]'
                : 'bg-[#9df197]/20 text-[#005c15] border border-[#9df197]/40'
            }`}
          >
            {toast.type === 'error' ? (
              <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
            <div className="flex-1">
              {toast.lines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <button
              onClick={() => setToast(null)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* 안건 목록 */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {items.map((item, i) => (
            <AgendaItemForm
              key={i}
              index={i}
              data={item}
              onChange={updateItem}
              onRemove={removeItem}
            />
          ))}

          {/* 안건 추가 버튼 */}
          <button
            onClick={addItem}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-ui-high text-sm font-semibold text-ui-variant hover:border-brand-primary hover:text-brand-primary hover:bg-brand-container/10 transition-all duration-200 cursor-pointer"
          >
            + 안건 추가
          </button>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-5 border-t border-ui-high/40 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full justify-center py-3"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                처리 중...
              </>
            ) : '최종 제출'}
          </button>
        </div>
      </div>
    </>
  );
}
