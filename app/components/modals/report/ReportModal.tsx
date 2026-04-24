'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { useMeetingStore } from '@/lib/store/meetingStore';
import ReportSidebar from './ReportSidebar';
import ReportPanel from './ReportPanel';

export default function ReportModal() {
  const { reportModalOpen, closeReportModal } = useUIStore();
  const { rounds, fetchRounds } = useMeetingStore();
  const [visible, setVisible] = useState(false);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);

  useEffect(() => {
    if (reportModalOpen) {
      fetchRounds();
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [reportModalOpen]);

  useEffect(() => {
    if (reportModalOpen && !selectedRoundId && rounds.length > 0) {
      setSelectedRoundId(rounds[0].id);
    }
  }, [reportModalOpen, rounds, selectedRoundId]);

  if (!reportModalOpen) return null;

  const completedRounds = rounds.filter(r => r.duration && r.duration !== '00:00:00');
  const selectedRound = completedRounds.find((r) => r.id === selectedRoundId) ?? completedRounds[0] ?? null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 no-print ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeReportModal}
      />

      <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-opacity duration-300 pointer-events-none ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div
          className={`w-full max-w-6xl bg-white rounded-3xl shadow-xl flex flex-col pointer-events-auto transform transition-transform duration-300 ease-out overflow-hidden ${visible ? 'scale-100' : 'scale-95'}`}
          style={{ height: '92vh' }}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-ui-high/40 shrink-0 no-print">
            <div>
              <h2 className="text-base font-bold font-display text-ui-on-surface">보고서 출력</h2>
              <p className="text-xs text-ui-variant mt-0.5">회의 회차별 의결 현황을 확인하고 PDF로 다운로드하세요</p>
            </div>
            <button onClick={closeReportModal} className="p-2 rounded-xl hover:bg-ui-low text-ui-variant transition-colors cursor-pointer">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 2-pane 레이아웃 */}
          <div className="flex flex-1 overflow-hidden">
            {completedRounds.length === 0 ? (
              <div className="flex-1 flex items-center justify-center px-8 py-8">
                <div className="text-center">
                  <p className="text-sm text-ui-variant">완료된 회의가 없습니다.</p>
                  <p className="text-xs text-ui-variant mt-1">본회의를 진행한 후 보고서를 확인하세요.</p>
                </div>
              </div>
            ) : (
              <>
                <ReportSidebar rounds={completedRounds} selectedRoundId={selectedRound?.id ?? null} onSelectRound={setSelectedRoundId} />
                <ReportPanel round={selectedRound} onClose={closeReportModal} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
