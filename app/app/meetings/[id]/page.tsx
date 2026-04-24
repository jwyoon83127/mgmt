'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { useMeetingStore } from '@/lib/store/meetingStore';
import { useUIStore } from '@/lib/store/uiStore';
import { useAuthStore } from '@/lib/store/authStore';
import ModalManager from '@/components/modals/ModalManager';
import { MeetingRound } from '@/lib/types/meeting';
import { Calendar, Clock, MapPin, Users, FileText, ChatCircle, Microphone, FileDoc, CaretLeft, CheckCircle, Circle } from '@phosphor-icons/react';

type StageKey = 'agenda' | 'preview' | 'live' | 'report';

interface StageDef {
  key: StageKey;
  step: number;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const STAGES: StageDef[] = [
  { key: 'agenda', step: 1, label: '안건 업로드', description: '안건을 등록하고 의결 문서를 업로드합니다.', icon: <FileText size={20} /> },
  { key: 'preview', step: 2, label: '사전 검토', description: '회의 전 의견을 개진하고 관련 데이터를 검토합니다.', icon: <ChatCircle size={20} /> },
  { key: 'live', step: 3, label: '본회의 진행', description: '음성 기반 자동 요약 및 안건별 표결을 진행합니다.', icon: <Microphone size={20} /> },
  { key: 'report', step: 4, label: '보고서 출력', description: '회의록을 확인하고 CEO 요약 보고서를 생성합니다.', icon: <FileDoc size={20} /> },
];

function resolveCurrentStage(round: MeetingRound): StageKey {
  if (!round.agendas || round.agendas.length === 0) return 'agenda';
  const allVoted = round.agendas.every(a => a.voteResult && a.voteResult !== 'pending');
  if (!allVoted) return 'preview';
  if (round.agendas.every(a => a.voteResult && a.voteResult !== 'pending') && round.duration === '00:00:00') return 'live';
  if (!round.aiSummary) return 'report';
  return 'report';
}

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;
  const { rounds, fetchRounds, isLoading } = useMeetingStore();
  const { openAgendaDrawer, openPreviewModal, openMeetingStartModal, openReportModal } = useUIStore();
  const isAdmin = useAuthStore(s => s.currentUser?.role === 'admin');

  const [round, setRound] = useState<MeetingRound | null>(null);

  useEffect(() => {
    if (rounds.length === 0) fetchRounds();
  }, [fetchRounds, rounds.length]);

  useEffect(() => {
    setRound(rounds.find(r => r.id === meetingId) || null);
  }, [rounds, meetingId]);

  if (!round && !isLoading) {
    return (
      <>
        <AppHeader />
        <main className="min-h-screen bg-ui-surface py-12">
          <div className="max-w-xl mx-auto px-6 text-center layer-card p-12">
            <h1 className="text-xl font-bold text-ui-on-surface mb-2">회의를 찾을 수 없습니다</h1>
            <button onClick={() => router.push('/meetings')} className="btn-secondary mt-4">회의 목록으로</button>
          </div>
        </main>
      </>
    );
  }

  if (!round) {
    return (
      <>
        <AppHeader />
        <main className="min-h-screen bg-ui-surface py-12 text-center text-sm text-ui-variant">로딩 중...</main>
      </>
    );
  }

  const currentStage = resolveCurrentStage(round);
  const stageOrder: StageKey[] = ['agenda', 'preview', 'live', 'report'];
  const currentIndex = stageOrder.indexOf(currentStage);

  const stageCTA = (stage: StageKey) => {
    switch (stage) {
      case 'agenda': return { label: '안건 등록/수정', onClick: () => openAgendaDrawer(round.id) };
      case 'preview': return { label: '사전 검토 열기', onClick: () => openPreviewModal(round.id) };
      case 'live': return { label: '본회의 시작', onClick: () => openMeetingStartModal(round.id) };
      case 'report': return { label: '보고서 확인', onClick: openReportModal };
    }
  };

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-ui-surface py-10">
        <div className="max-w-5xl mx-auto px-6">
          {/* 브레드크럼 */}
          <button
            onClick={() => router.push('/meetings')}
            className="flex items-center gap-1 text-sm text-ui-variant hover:text-ui-on-surface mb-4 cursor-pointer"
          >
            <CaretLeft size={16} weight="bold" /> 회의 목록
          </button>

          {/* 헤더 카드 */}
          <div className="layer-card p-8 mb-6">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <span className="text-xs font-bold text-brand-primary bg-brand-container/30 px-2.5 py-0.5 rounded-full">
                  {round.year}년 제{round.round}회
                </span>
                <h1 className="text-2xl font-bold font-display text-ui-on-surface mt-2 mb-2">
                  경영집행위원회
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-ui-variant">
                  <span className="flex items-center gap-1.5"><Calendar size={16} className="text-brand-primary" />{round.date}</span>
                  <span className="flex items-center gap-1.5"><Clock size={16} className="text-brand-primary" />{round.time}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={16} className="text-brand-primary" />{round.location}</span>
                  <span className="flex items-center gap-1.5"><Users size={16} className="text-brand-primary" />{round.attendees.length}명</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-ui-variant">현재 단계</p>
                <p className="text-base font-bold text-brand-primary mt-1">
                  {STAGES[currentIndex].step}. {STAGES[currentIndex].label}
                </p>
                {isAdmin && (
                  <button
                    onClick={stageCTA(currentStage).onClick}
                    className="btn-primary mt-3"
                  >
                    {stageCTA(currentStage).label}
                  </button>
                )}
              </div>
            </div>

            {round.attendees.length > 0 && (
              <div className="mt-4 pt-4 border-t border-ui-high/40">
                <p className="text-xs text-ui-variant mb-2">참석자</p>
                <div className="flex flex-wrap gap-1.5">
                  {round.attendees.map(name => (
                    <span key={name} className="text-xs px-2.5 py-1 rounded-full bg-ui-low text-ui-on-surface">{name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 플로우 타임라인 */}
          <div className="layer-card p-8 mb-6">
            <h2 className="text-sm font-bold text-ui-variant uppercase tracking-wider mb-5">진행 플로우</h2>
            <ol className="relative space-y-5">
              {STAGES.map((s, idx) => {
                const isDone = idx < currentIndex;
                const isActive = idx === currentIndex;
                return (
                  <li key={s.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isDone ? 'bg-brand-primary text-white'
                          : isActive ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20'
                          : 'bg-ui-low text-ui-variant'
                      }`}>
                        {isDone ? <CheckCircle size={18} weight="fill" /> : s.icon}
                      </div>
                      {idx < STAGES.length - 1 && (
                        <div className={`w-0.5 flex-1 mt-1 ${isDone ? 'bg-brand-primary' : 'bg-ui-high'}`} style={{ minHeight: 32 }} />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <p className={`text-sm font-bold ${isActive ? 'text-brand-primary' : 'text-ui-on-surface'}`}>
                            {s.step}. {s.label}
                            {isActive && <span className="ml-2 text-[10px] font-bold text-brand-primary bg-brand-container/40 px-2 py-0.5 rounded-full">진행중</span>}
                            {isDone && <span className="ml-2 text-[10px] font-bold text-ui-variant bg-ui-low px-2 py-0.5 rounded-full">완료</span>}
                          </p>
                          <p className="text-xs text-ui-variant mt-1">{s.description}</p>
                        </div>
                        {isAdmin && (isActive || isDone || s.key === 'live') && s.key !== 'agenda' && (
                          <button onClick={stageCTA(s.key).onClick} className="btn-primary text-xs">
                            {stageCTA(s.key).label} →
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* 안건 리스트 */}
          <div className="layer-card p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-ui-variant uppercase tracking-wider">등록된 안건 ({round.agendas.length}건)</h2>
              {isAdmin && (
                <button onClick={() => openAgendaDrawer(round.id)} className="btn-secondary text-xs">안건 추가/수정</button>
              )}
            </div>
            {round.agendas.length === 0 ? (
              <p className="py-8 text-center text-sm text-ui-variant">등록된 안건이 없습니다. 안건을 먼저 등록하세요.</p>
            ) : (
              <ul className="space-y-2">
                {round.agendas.map((a) => (
                  <li key={a.index} className="p-4 rounded-xl border border-ui-high/40 bg-ui-lowest flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-brand-primary mr-2">#{a.index}</span>
                      <span className="text-sm font-medium text-ui-on-surface">{a.title}</span>
                      {a.voteComment && <p className="text-xs text-ui-variant mt-1 ml-6">{a.voteComment}</p>}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${
                      a.voteResult === 'approved' ? 'bg-status-t-container text-status-on-t-container'
                      : a.voteResult === 'conditional' ? 'bg-status-s-container text-status-on-s-container'
                      : a.voteResult === 'review' ? 'bg-status-e-container text-status-on-e-container'
                      : 'bg-ui-high text-ui-variant'
                    }`}>
                      {a.voteResult === 'approved' ? '가결'
                        : a.voteResult === 'conditional' ? '조건부'
                        : a.voteResult === 'review' ? '보류'
                        : '대기'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      <ModalManager />
    </>
  );
}
