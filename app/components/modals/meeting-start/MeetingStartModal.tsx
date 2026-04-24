'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { useLiveMeetingStore } from '@/lib/store/liveMeetingStore';
import { useMeetingStore } from '@/lib/store/meetingStore';
import { useAuthStore } from '@/lib/store/authStore';
import { LiveAgenda } from '@/lib/types/meeting';

export default function MeetingStartModal() {
  const { meetingStartModalOpen, closeMeetingStartModal, openLiveMeeting, pendingRoundId } = useUIStore();
  const { initMeeting } = useLiveMeetingStore();
  const { rounds } = useMeetingStore();
  const users = useAuthStore(s => s.users);

  const round = pendingRoundId ? rounds.find(r => r.id === pendingRoundId) : null;

  const agendas: LiveAgenda[] = (round?.agendas ?? []).map(a => ({
    id: `agenda-${a.index}`,
    index: a.index,
    title: a.title,
    subtitle: '',
    attachmentName: '',
    content: '',
  }));

  const allUserNames = users.map(u => u.name);
  const initialAttendees = round?.attendees?.length
    ? round.attendees
    : allUserNames;

  const [selectedAgendas, setSelectedAgendas] = useState<number[]>([]);
  const [attendees, setAttendees] = useState<string[]>(initialAttendees);
  const [newAttendee, setNewAttendee] = useState('');
  const [meetingDetails, setMeetingDetails] = useState({
    location: round?.location || '회의실 A',
    time: round?.time || '10:00',
    date: round?.date || new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (meetingStartModalOpen) {
      setSelectedAgendas(agendas.map((_, i) => i));
      setAttendees(round?.attendees?.length ? round.attendees : allUserNames);
      setMeetingDetails({
        location: round?.location || '회의실 A',
        time: round?.time || '10:00',
        date: round?.date || new Date().toISOString().split('T')[0],
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingStartModalOpen, pendingRoundId]);

  const handleSelectAgenda = (index: number) => {
    setSelectedAgendas(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleToggleAllAgendas = () => {
    setSelectedAgendas(
      selectedAgendas.length === agendas.length ? [] : agendas.map((_, i) => i)
    );
  };

  const handleRemoveAttendee = (name: string) => {
    setAttendees(prev => prev.filter(a => a !== name));
  };

  const handleAddAttendee = () => {
    const name = newAttendee.trim();
    if (name && !attendees.includes(name)) {
      setAttendees(prev => [...prev, name]);
    }
    setNewAttendee('');
  };

  const handleStartMeeting = () => {
    if (selectedAgendas.length === 0) {
      alert('최소 하나 이상의 안건을 선택해주세요.');
      return;
    }
    const agendasToUse = agendas.filter((_, i) => selectedAgendas.includes(i));
    initMeeting(agendasToUse, round?.round ?? 0, pendingRoundId ?? '');
    closeMeetingStartModal();
    openLiveMeeting();
  };

  if (!meetingStartModalOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={closeMeetingStartModal}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-2xl bg-white rounded-3xl shadow-lg pointer-events-auto flex flex-col max-h-[92vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="px-8 py-6 border-b border-ui-high/40 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold font-display text-ui-on-surface">회의 개최</h1>
              <button onClick={closeMeetingStartModal} className="text-ui-variant hover:text-ui-on-surface transition-colors cursor-pointer">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-ui-variant">회의에 포함할 안건을 선택하고 회의를 시작하세요</p>
          </div>

          {/* 컨텐츠 */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
            {/* 회의 기본정보 */}
            <div className="rounded-2xl border border-ui-high/40 p-5 bg-ui-surface">
              <h3 className="text-sm font-bold text-ui-on-surface mb-4">회의 기본정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-ui-variant font-semibold mb-1.5 block">날짜</label>
                  <input
                    type="date"
                    value={meetingDetails.date}
                    onChange={e => setMeetingDetails({ ...meetingDetails, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-ui-high/40 text-sm text-ui-on-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-ui-variant font-semibold mb-1.5 block">시간</label>
                  <input
                    type="time"
                    value={meetingDetails.time}
                    onChange={e => setMeetingDetails({ ...meetingDetails, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-ui-high/40 text-sm text-ui-on-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-ui-variant font-semibold mb-1.5 block">장소</label>
                  <input
                    type="text"
                    value={meetingDetails.location}
                    onChange={e => setMeetingDetails({ ...meetingDetails, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-ui-high/40 text-sm text-ui-on-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="회의실 위치"
                  />
                </div>
              </div>
            </div>

            {/* 참석자 */}
            <div className="rounded-2xl border border-ui-high/40 p-5 bg-ui-surface">
              <h3 className="text-sm font-bold text-ui-on-surface mb-3">참석자</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {attendees.map((name, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white text-ui-on-surface border border-ui-high/40"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(name)}
                      className="w-3.5 h-3.5 rounded-full text-ui-variant hover:text-[#ba1a1a] transition-colors cursor-pointer"
                      aria-label={`${name} 제거`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAttendee}
                  onChange={e => setNewAttendee(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddAttendee(); } }}
                  placeholder="참석자 이름 추가..."
                  className="flex-1 px-3 py-2 rounded-lg border border-ui-high/40 text-sm text-ui-on-surface focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-ui-variant"
                />
                <button
                  type="button"
                  onClick={handleAddAttendee}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-ui-low text-ui-on-surface hover:bg-ui-high transition-colors cursor-pointer"
                >
                  추가
                </button>
              </div>
            </div>

            {/* 안건 선택 */}
            <div className="rounded-2xl border border-ui-high/40 p-5 bg-ui-surface">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-ui-on-surface">안건 선택</h3>
                <button
                  onClick={handleToggleAllAgendas}
                  className="text-xs font-semibold text-brand-primary hover:text-brand-dim transition-colors cursor-pointer"
                >
                  {selectedAgendas.length === agendas.length ? '모두 해제' : '모두 선택'}
                </button>
              </div>

              {agendas.length === 0 ? (
                <p className="text-sm text-ui-variant text-center py-4">등록된 안건이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {agendas.map((agenda, idx) => (
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
                          readOnly
                          checked={selectedAgendas.includes(idx)}
                          className="mt-0.5 w-4 h-4 accent-brand-primary cursor-pointer"
                        />
                        <div>
                          <p className="text-sm font-semibold text-ui-on-surface">안건 {agenda.index}: {agenda.title}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-ui-variant mt-3">
                선택된 안건: <span className="font-semibold text-brand-primary">{selectedAgendas.length}개</span>
              </p>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="px-8 py-5 border-t border-ui-high/40 shrink-0 flex gap-3">
            <button
              onClick={closeMeetingStartModal}
              className="flex-1 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all bg-ui-low text-ui-on-surface hover:bg-ui-high"
            >
              취소
            </button>
            <button
              onClick={handleStartMeeting}
              disabled={selectedAgendas.length === 0}
              className="flex-1 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:cursor-default transition-all bg-brand-primary text-white hover:bg-brand-dim disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
              </svg>
              회의 시작 ({selectedAgendas.length}/{agendas.length})
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
