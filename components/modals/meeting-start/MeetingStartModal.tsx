'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { useLiveMeetingStore } from '@/lib/store/liveMeetingStore';
import { mockLiveAgendas } from '@/lib/mock/meetings';

export default function MeetingStartModal() {
  const { meetingStartModalOpen, closeMeetingStartModal, openLiveMeeting } = useUIStore();
  const { initMeeting } = useLiveMeetingStore();

  const [selectedAgendas, setSelectedAgendas] = useState<number[]>([]);
  const [meetingDetails, setMeetingDetails] = useState({
    location: '회의실 A',
    time: '10:00',
    date: new Date().toISOString().split('T')[0],
    attendees: ['김회장', '이부회장', '박이사', '정이사'],
  });

  const handleSelectAgenda = (index: number) => {
    setSelectedAgendas((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleToggleAllAgendas = () => {
    if (selectedAgendas.length === mockLiveAgendas.length) {
      setSelectedAgendas([]);
    } else {
      setSelectedAgendas(mockLiveAgendas.map((_, i) => i));
    }
  };

  const handleStartMeeting = () => {
    if (selectedAgendas.length === 0) {
      alert('최소 하나 이상의 안건을 선택해주세요.');
      return;
    }

    const agendasToUse = mockLiveAgendas.filter((_, i) => selectedAgendas.includes(i));
    const meetingRound = new Date().getFullYear() === 2026 ? 10 : 1;

    // Initialize the meeting with selected agendas
    initMeeting(agendasToUse, meetingRound);

    // Close this modal and open the live meeting modal
    closeMeetingStartModal();
    openLiveMeeting();
  };

  if (!meetingStartModalOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeMeetingStartModal}
      />

      {/* 모달 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-2xl bg-white rounded-3xl shadow-lg pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="px-8 py-6 border-b border-ui-high/40 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold font-display text-ui-on-surface">회의 개최</h1>
              <button
                onClick={closeMeetingStartModal}
                className="text-ui-variant hover:text-ui-on-surface transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-ui-variant">회의에 포함할 안건을 선택하고 회의를 시작하세요</p>
          </div>

          {/* 컨텐츠 */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {/* 회의 기본정보 */}
            <div className="rounded-2xl border border-ui-high/40 p-6" style={{ background: '#f8f9fa' }}>
              <h3 className="text-sm font-bold text-ui-on-surface mb-4">회의 기본정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-ui-variant font-semibold mb-2 block">날짜</label>
                  <input
                    type="date"
                    value={meetingDetails.date}
                    onChange={(e) => setMeetingDetails({ ...meetingDetails, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-ui-high/40 text-sm text-ui-on-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-ui-variant font-semibold mb-2 block">시간</label>
                  <input
                    type="time"
                    value={meetingDetails.time}
                    onChange={(e) => setMeetingDetails({ ...meetingDetails, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-ui-high/40 text-sm text-ui-on-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-ui-variant font-semibold mb-2 block">장소</label>
                  <input
                    type="text"
                    value={meetingDetails.location}
                    onChange={(e) => setMeetingDetails({ ...meetingDetails, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-ui-high/40 text-sm text-ui-on-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="회의실 위치"
                  />
                </div>
              </div>
            </div>

            {/* 참석자 */}
            <div className="rounded-2xl border border-ui-high/40 p-6" style={{ background: '#f8f9fa' }}>
              <h3 className="text-sm font-bold text-ui-on-surface mb-4">참석자</h3>
              <div className="flex flex-wrap gap-2">
                {meetingDetails.attendees.map((attendee, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-ui-low text-ui-on-surface border border-ui-high/40">
                    {attendee}
                  </span>
                ))}
              </div>
              <p className="text-xs text-ui-variant mt-3">
                💡 안건별 의견 작성자들이 자동으로 참석자로 등록됩니다.
              </p>
            </div>

            {/* 안건 선택 */}
            <div className="rounded-2xl border border-ui-high/40 p-6" style={{ background: '#f8f9fa' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-ui-on-surface">안건 선택</h3>
                <button
                  onClick={handleToggleAllAgendas}
                  className="text-xs font-semibold text-brand-primary hover:text-brand-dim transition-colors"
                >
                  {selectedAgendas.length === mockLiveAgendas.length ? '모두 해제' : '모두 선택'}
                </button>
              </div>

              <div className="space-y-2">
                {mockLiveAgendas.map((agenda, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectAgenda(idx)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAgendas.includes(idx)
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-ui-high/40 bg-white hover:border-brand-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedAgendas.includes(idx)}
                        onChange={() => {}}
                        className="mt-1 w-5 h-5 accent-brand-primary cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-ui-on-surface">안건 {agenda.index}: {agenda.title}</p>
                        <p className="text-xs text-ui-variant mt-1">{agenda.subtitle}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-ui-variant mt-4">
                선택된 안건: <span className="font-semibold text-brand-primary">{selectedAgendas.length}개</span>
              </p>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="px-8 py-6 border-t border-ui-high/40 shrink-0 flex gap-3">
            <button
              onClick={closeMeetingStartModal}
              className="flex-1 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 bg-ui-low text-ui-on-surface hover:bg-ui-low/80"
            >
              취소
            </button>
            <button
              onClick={handleStartMeeting}
              disabled={selectedAgendas.length === 0}
              className="flex-1 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:cursor-default transition-all duration-200 bg-brand-primary text-white hover:bg-brand-dim disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              </svg>
              회의 시작 ({selectedAgendas.length}/{mockLiveAgendas.length})
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
