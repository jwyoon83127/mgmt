'use client';

import { useEffect, useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import { useMeetingStore } from '@/lib/store/meetingStore';
import { useAuthStore } from '@/lib/store/authStore';
import { MeetingRound, VoteType, VoteResult } from '@/lib/types/meeting';
import { CaretRight, Plus, Calendar, Clock, MapPin, Users, ChartBar, FileText, CheckCircle, Warning, Info } from '@phosphor-icons/react';

export default function MeetingsPage() {
  const { rounds, fetchRounds, addRound, isLoading, error } = useMeetingStore();
  const isAdmin = useAuthStore((state) => state.currentUser?.role === 'admin');
  const [selectedRound, setSelectedRound] = useState<MeetingRound | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  // 새 회차 생성 폼 상태
  const [newRoundData, setNewRoundData] = useState({
    year: new Date().getFullYear(),
    round: (rounds[0]?.round || 0) + 1,
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    location: '대회의실 A',
    attendees: '',
  });

  const handleCreateRound = (e: React.FormEvent) => {
    e.preventDefault();
    const newRound: MeetingRound = {
      id: `round-${newRoundData.year}-${newRoundData.round}`,
      year: newRoundData.year,
      round: newRoundData.round,
      date: newRoundData.date,
      time: newRoundData.time,
      location: newRoundData.location,
      attendees: newRoundData.attendees.split(',').map(s => s.trim()).filter(s => s),
      agendas: [],
      voteStats: { approved: 0, conditional: 0, review: 0 },
      duration: '00:00:00',
      createdAt: new Date(),
    };
    addRound(newRound);
    setIsCreating(false);
  };

  const getVoteResultColor = (result: VoteType | VoteResult) => {
    switch (result) {
      case 'approved': return 'bg-status-t-container text-status-on-t-container';
      case 'conditional': return 'bg-status-s-container text-status-on-s-container';
      case 'review': return 'bg-status-e-container text-status-on-e-container';
      default: return 'bg-ui-high text-ui-variant';
    }
  };

  const getVoteResultLabel = (result: VoteType | VoteResult) => {
    switch (result) {
      case 'approved': return '가결';
      case 'conditional': return '조건부 가결';
      case 'review': return '보류/재검토';
      default: return result;
    }
  };

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-ui-surface py-12 no-print">
        <div className="max-w-7xl mx-auto px-6">
          {/* 헤더 섹션 */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 rounded-full bg-brand-primary" />
                <h1 className="text-2xl font-bold font-display text-ui-on-surface">회의 관리</h1>
              </div>
              <p className="text-ui-variant">정기회의의 회차 정보를 관리하고 과거 이력을 확인합니다</p>
            </div>

            {isAdmin && (
              <button 
                onClick={() => setIsCreating(true)}
                className="btn-primary"
              >
                <Plus size={18} weight="bold" />
                신규 회차 생성
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽: 회차 목록 */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-sm font-bold text-ui-variant uppercase tracking-wider px-2">회차 목록</h2>
              <div className="space-y-3">
                {rounds.map((round) => (
                  <button
                    key={round.id}
                    onClick={() => setSelectedRound(round)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 border ${
                      selectedRound?.id === round.id 
                        ? 'bg-white border-brand-primary shadow-lg -translate-y-1' 
                        : 'bg-white border-ui-high/40 hover:border-brand-primary/40 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-brand-primary bg-brand-container px-2 py-0.5 rounded-full">
                        {round.year}년 제{round.round}회
                      </span>
                      <span className="text-[10px] text-ui-variant font-medium">
                        {round.date}
                      </span>
                    </div>
                    <h3 className="font-bold text-ui-on-surface mb-3">정기 경영집행위원회</h3>
                    <div className="flex items-center gap-3 text-xs text-ui-variant">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{round.attendees.length}명</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChartBar size={14} />
                        <span>안건 {round.agendas.length}건</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 오른쪽: 상세 정보 */}
            <div className="lg:col-span-2">
              {selectedRound ? (
                <div className="layer-card p-8 animate-fade-in-up">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-2xl font-bold font-display text-ui-on-surface mb-2">
                        {selectedRound.year}년 제{selectedRound.round}회 정기회의 결과
                      </h2>
                      <div className="flex flex-wrap gap-4 text-sm text-ui-variant">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={18} className="text-brand-primary" />
                          <span>{selectedRound.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={18} className="text-brand-primary" />
                          <span>{selectedRound.time} (소요: {selectedRound.duration})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={18} className="text-brand-primary" />
                          <span>{selectedRound.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-ui-surface p-4 rounded-2xl border border-ui-high/40">
                      <p className="text-xs font-bold text-ui-variant mb-1 uppercase">참석자</p>
                      <p className="text-sm font-semibold text-ui-on-surface">{selectedRound.attendees.join(', ')}</p>
                    </div>
                    <div className="bg-ui-surface p-4 rounded-2xl border border-ui-high/40 flex flex-col justify-center">
                      <p className="text-xs font-bold text-ui-variant mb-2 uppercase">의결 현황</p>
                      <div className="flex gap-2">
                        <div className="flex-1 text-center">
                          <p className="text-[10px] text-ui-variant">가결</p>
                          <p className="font-bold text-status-tertiary">{selectedRound.voteStats.approved}</p>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="text-[10px] text-ui-variant">조건부</p>
                          <p className="font-bold text-status-secondary">{selectedRound.voteStats.conditional}</p>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="text-[10px] text-ui-variant">보류</p>
                          <p className="font-bold text-status-error">{selectedRound.voteStats.review}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-ui-surface p-4 rounded-2xl border border-ui-high/40">
                      <p className="text-xs font-bold text-ui-variant mb-1 uppercase">AI 요약</p>
                      <p className="text-xs text-ui-on-surface line-clamp-3">{selectedRound.aiSummary || '요약 정보가 없습니다.'}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="font-bold text-ui-on-surface flex items-center gap-2">
                      <FileText size={20} className="text-brand-primary" />
                      안건별 의결 결과
                    </h3>
                    
                    {selectedRound.agendas.length > 0 ? (
                      <div className="space-y-4">
                        {selectedRound.agendas.map((agenda, idx) => (
                          <div key={idx} className="p-5 rounded-2xl border border-ui-high/40 bg-ui-lowest hover:border-brand-primary/20 transition-colors">
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <h4 className="font-bold text-ui-on-surface flex-1">
                                <span className="text-brand-primary mr-2">#{agenda.index}</span>
                                {agenda.title}
                              </h4>
                              <span className={`badge ${getVoteResultColor(agenda.voteResult)}`}>
                                {getVoteResultLabel(agenda.voteResult)}
                              </span>
                            </div>
                            {agenda.voteComment && (
                              <div className="mt-3 flex gap-2 p-3 bg-ui-surface rounded-xl text-sm text-ui-variant">
                                <Info size={16} className="shrink-0 mt-0.5" />
                                <p>{agenda.voteComment}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-ui-surface rounded-2xl border border-dashed border-ui-high">
                        <p className="text-ui-variant">등록된 안건이 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-ui-high shadow-ambient">
                  <div className="w-16 h-16 rounded-2xl bg-ui-low flex items-center justify-center text-ui-variant mb-4">
                    <Calendar size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-ui-on-surface mb-2">회차를 선택해주세요</h3>
                  <p className="text-sm text-ui-variant">좌측 목록에서 상세 내용을 확인할 회차를 선택하세요</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 회차 생성 모달 */}
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreating(false)} />
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
              <div className="px-8 py-6 border-b border-ui-high flex justify-between items-center">
                <h2 className="text-xl font-bold font-display text-ui-on-surface">신규 회차 생성</h2>
                <button onClick={() => setIsCreating(false)} className="text-ui-variant hover:text-ui-on-surface">
                  <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                </button>
              </div>
              
              <form onSubmit={handleCreateRound} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ui-variant uppercase">연도</label>
                    <input 
                      type="number" 
                      value={newRoundData.year}
                      onChange={(e) => setNewRoundData({...newRoundData, year: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 rounded-xl border border-ui-high focus:border-brand-primary outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ui-variant uppercase">회차</label>
                    <input 
                      type="number" 
                      value={newRoundData.round}
                      onChange={(e) => setNewRoundData({...newRoundData, round: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 rounded-xl border border-ui-high focus:border-brand-primary outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ui-variant uppercase">날짜</label>
                    <input 
                      type="date" 
                      value={newRoundData.date}
                      onChange={(e) => setNewRoundData({...newRoundData, date: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-ui-high focus:border-brand-primary outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ui-variant uppercase">시간</label>
                    <input 
                      type="time" 
                      value={newRoundData.time}
                      onChange={(e) => setNewRoundData({...newRoundData, time: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-ui-high focus:border-brand-primary outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ui-variant uppercase">장소</label>
                  <input 
                    type="text" 
                    value={newRoundData.location}
                    onChange={(e) => setNewRoundData({...newRoundData, location: e.target.value})}
                    placeholder="대회의실 A"
                    className="w-full px-4 py-2.5 rounded-xl border border-ui-high focus:border-brand-primary outline-none text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ui-variant uppercase">참석자 (쉼표로 구분)</label>
                  <textarea 
                    value={newRoundData.attendees}
                    onChange={(e) => setNewRoundData({...newRoundData, attendees: e.target.value})}
                    placeholder="홍길동, 김철수, 이영희..."
                    className="w-full px-4 py-2.5 rounded-xl border border-ui-high focus:border-brand-primary outline-none text-sm min-h-[80px] resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 btn-secondary"
                  >
                    취소
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    생성하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
