'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { useLiveMeetingStore } from '@/lib/store/liveMeetingStore';
import { formatElapsedTime } from '@/lib/utils/meetingRound';
import LiveSidebar from './LiveSidebar';
import OpeningPanel from './panels/OpeningPanel';
import AgendaPanel from './panels/AgendaPanel';
import ClosingPanel from './panels/ClosingPanel';

export default function LiveMeetingModal() {
  const { liveMeetingOpen, closeLiveMeeting } = useUIStore();
  const { currentStep, totalSteps, agendas, elapsedSeconds, timerActive, tickTimer, resetMeeting, meetingRound } = useLiveMeetingStore();

  // 타이머
  useEffect(() => {
    if (!timerActive || !liveMeetingOpen) return;
    const id = setInterval(tickTimer, 1000);
    return () => clearInterval(id);
  }, [timerActive, liveMeetingOpen, tickTimer]);

  const handleClose = () => {
    closeLiveMeeting();
    setTimeout(resetMeeting, 300);
  };

  if (!liveMeetingOpen) return null;

  // 현재 패널 결정
  const isOpening = currentStep === 0;
  const isClosing = currentStep === totalSteps - 1 && totalSteps > 0;
  const agendaStep = !isOpening && !isClosing ? currentStep : null;
  const currentAgenda = agendaStep !== null ? agendas[agendaStep - 1] : null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#ffffff' }}>
      {/* 헤더 바 */}
      <div
        className="flex items-center justify-between px-6 h-14 shrink-0 border-b"
        style={{ background: '#f8f9fa', borderColor: '#e0e4e8' }}
      >
        {/* 좌측: 라이브 인디케이터 + 타이틀 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff4444] animate-pulse-dot" />
            <span className="text-xs font-bold text-[#ff4444] tracking-widest">LIVE REC</span>
          </div>
          <div className="w-px h-4" style={{ background: '#d0d5dc' }} />
          <p className="text-sm font-semibold text-ui-on-surface">
            2026-{String(meetingRound).padStart(2, '0')}회차 정기회의
          </p>
        </div>

        {/* 중앙: 타이머 */}
        <div className="font-display font-bold text-xl text-ui-on-surface tabular-nums">
          {formatElapsedTime(elapsedSeconds)}
        </div>

        {/* 우측: 종료 */}
        <button
          onClick={handleClose}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-ui-variant hover:text-ui-on-surface hover:bg-ui-low transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          회의 종료
        </button>
      </div>

      {/* 본문 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 */}
        <LiveSidebar />

        {/* 메인 패널 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isOpening && <OpeningPanel />}

          {currentAgenda && (
            <AgendaPanel
              key={currentAgenda.id}
              agenda={currentAgenda}
              agendaIndex={currentAgenda.index}
              isLast={currentStep === totalSteps - 2}
            />
          )}

          {isClosing && <ClosingPanel />}

          {/* 오프닝 패널에서 다음 버튼 */}
          {isOpening && (
            <div className="px-8 py-5 border-t shrink-0" style={{ background: '#f8f9fa', borderColor: '#e0e4e8' }}>
              <div className="flex justify-end">
                <button
                  onClick={() => useLiveMeetingStore.getState().nextStep()}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-brand-primary text-white hover:bg-brand-dim transition-colors cursor-pointer"
                >
                  회의 시작 →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
