'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { mockMeetingRounds } from '@/lib/mock/archive';
import { getCompletedMeetings } from '@/lib/utils/meetingSaver';
import ReportSidebar from './ReportSidebar';
import ReportPanel from './ReportPanel';

export default function ReportModal() {
  const { reportModalOpen, closeReportModal } = useUIStore();
  const [visible, setVisible] = useState(false);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [allRounds, setAllRounds] = useState(mockMeetingRounds);

  useEffect(() => {
    // Load both mock and completed meetings and ensure uniqueness by ID
    const completedMeetings = getCompletedMeetings();
    const combined = [...completedMeetings, ...mockMeetingRounds];
    
    // ID를 기준으로 중복 제거
    const uniqueRounds = Array.from(
      new Map(combined.map(item => [item.id, item])).values()
    );
    
    setAllRounds(uniqueRounds);
  }, []);

  useEffect(() => {
    if (reportModalOpen) {
      setTimeout(() => {
        setVisible(true);
        if (!selectedRoundId && allRounds.length > 0) {
          setSelectedRoundId(allRounds[0].id);
        }
      }, 10);
    } else {
      setVisible(false);
    }
  }, [reportModalOpen, selectedRoundId, allRounds]);

  if (!reportModalOpen) return null;

  const selectedRound = allRounds.find((r) => r.id === selectedRoundId) || null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 no-print ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeReportModal}
      />

      <div className={`drawer-panel w-full md:w-[1000px] transform transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ui-high shrink-0 no-print">
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
          <ReportSidebar rounds={allRounds} selectedRoundId={selectedRoundId} onSelectRound={setSelectedRoundId} />
          <ReportPanel round={selectedRound} />
        </div>
      </div>
    </>
  );
}
