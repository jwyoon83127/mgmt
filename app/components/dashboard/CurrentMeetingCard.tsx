'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MeetingRound } from '@/lib/types/meeting';
import { useUIStore } from '@/lib/store/uiStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useMeetingStore } from '@/lib/store/meetingStore';
import { Calendar, Clock, MapPin, Users, ArrowRight, CheckCircle, FileText, ChatCircle, Microphone, FileDoc, PencilSimple, Check, X } from '@phosphor-icons/react';

type StageKey = 'agenda' | 'preview' | 'live' | 'report';

const STAGES: { key: StageKey; step: number; label: string; short: string; icon: React.ReactNode }[] = [
  { key: 'agenda', step: 1, label: '안건 업로드', short: '안건', icon: <FileText size={14} /> },
  { key: 'preview', step: 2, label: '사전 검토', short: '검토', icon: <ChatCircle size={14} /> },
  { key: 'live', step: 3, label: '본회의 진행', short: '본회의', icon: <Microphone size={14} /> },
  { key: 'report', step: 4, label: '보고서 출력', short: '보고서', icon: <FileDoc size={14} /> },
];

function resolveStage(round: MeetingRound): StageKey {
  if (!round.agendas || round.agendas.length === 0) return 'agenda';
  const allVoted = round.agendas.every(a => a.voteResult && a.voteResult !== 'pending');
  if (!allVoted) return 'preview';
  if (round.duration === '00:00:00') return 'live';
  if (!round.aiSummary) return 'report';
  return 'report';
}

export default function CurrentMeetingCard({ round }: { round: MeetingRound }) {
  const router = useRouter();
  const { openAgendaDrawer, openPreviewModal, openMeetingStartModal, openReportModal } = useUIStore();
  const isAdmin = useAuthStore(s => s.currentUser?.role === 'admin');
  const { updateRound } = useMeetingStore();

  const [editing, setEditing] = useState(false);
  const [editDate, setEditDate] = useState(round.date);
  const [editTime, setEditTime] = useState(round.time);
  const [editLocation, setEditLocation] = useState(round.location);

  const stage = resolveStage(round);
  const stageOrder: StageKey[] = ['agenda', 'preview', 'live', 'report'];
  const currentIndex = stageOrder.indexOf(stage);

  const pendingCount = round.agendas.filter(a => !a.voteResult || a.voteResult === 'pending').length;
  const allReviewed = round.agendas.length > 0 && pendingCount === 0;

  const handleSaveEdit = async () => {
    await updateRound(round.id, { date: editDate, time: editTime, location: editLocation });
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditDate(round.date);
    setEditTime(round.time);
    setEditLocation(round.location);
    setEditing(false);
  };

  const cta: Record<StageKey, { label: string; onClick: () => void }> = {
    agenda: { label: '안건 등록하기', onClick: () => openAgendaDrawer(round.id) },
    preview: { label: '회의 안건 검토', onClick: () => openPreviewModal(round.id) },
    live: { label: '본회의 시작', onClick: () => openMeetingStartModal(round.id) },
    report: { label: '보고서 확인', onClick: openReportModal },
  };

  return (
    <div className="layer-card p-8">
      <div className="flex items-start justify-between flex-wrap gap-6 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-bold text-brand-primary bg-brand-container/30 px-2.5 py-0.5 rounded-full">
              {round.year}년 제{round.round}회
            </span>
            <span className="text-[10px] font-bold text-white bg-brand-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
              진행중
            </span>
          </div>
          <h2 className="text-xl font-bold font-display text-ui-on-surface mb-2">경영집행위원회</h2>

          {editing ? (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-brand-primary shrink-0" />
                  <input
                    type="text"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="text-sm border border-ui-high/50 rounded-lg px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="2026-05-01"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-brand-primary shrink-0" />
                  <input
                    type="text"
                    value={editTime}
                    onChange={e => setEditTime(e.target.value)}
                    className="text-sm border border-ui-high/50 rounded-lg px-2 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="10:00"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-brand-primary shrink-0" />
                  <input
                    type="text"
                    value={editLocation}
                    onChange={e => setEditLocation(e.target.value)}
                    className="text-sm border border-ui-high/50 rounded-lg px-2 py-1 w-36 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    placeholder="장소"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleSaveEdit} className="flex items-center gap-1 text-xs font-semibold text-white bg-brand-primary px-3 py-1.5 rounded-lg hover:bg-brand-dim transition-colors cursor-pointer">
                  <Check size={12} weight="bold" /> 저장
                </button>
                <button onClick={handleCancelEdit} className="flex items-center gap-1 text-xs font-semibold text-ui-variant hover:text-ui-on-surface px-3 py-1.5 rounded-lg hover:bg-ui-low transition-colors cursor-pointer">
                  <X size={12} weight="bold" /> 취소
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 text-sm text-ui-variant items-center">
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-brand-primary" />{round.date}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-brand-primary" />{round.time}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-primary" />{round.location}</span>
              <span className="flex items-center gap-1.5"><Users size={14} className="text-brand-primary" />{round.attendees.length}명</span>
              {isAdmin && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-ui-variant hover:text-brand-primary transition-colors cursor-pointer"
                >
                  <PencilSimple size={13} /> 수정
                </button>
              )}
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-ui-variant mb-1">현재 단계</p>
          <p className="text-lg font-bold text-brand-primary mb-3">
            {STAGES[currentIndex].step}. {STAGES[currentIndex].label}
          </p>
          {isAdmin && (
            <div className="flex items-center gap-2 justify-end flex-wrap">
              {/* 회의 안건 검토 (primary, first) */}
              {stage === 'preview' && (
                <button onClick={cta[stage].onClick} className="btn-primary relative">
                  {cta[stage].label} <ArrowRight size={14} weight="bold" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
                      {pendingCount}
                    </span>
                  )}
                </button>
              )}
              {stage === 'agenda' && (
                <button onClick={cta[stage].onClick} className="btn-primary">
                  {cta[stage].label} <ArrowRight size={14} weight="bold" />
                </button>
              )}
              {stage === 'live' && (
                <button onClick={cta[stage].onClick} className="btn-primary">
                  {cta[stage].label} <ArrowRight size={14} weight="bold" />
                </button>
              )}
              {stage === 'report' && (
                <button onClick={cta[stage].onClick} className="btn-primary">
                  {cta[stage].label} <ArrowRight size={14} weight="bold" />
                </button>
              )}
              {/* 회의 시작 — 안건/검토 단계에서 추가 표시 */}
              {(stage === 'preview' || stage === 'agenda') && (
                <button
                  onClick={() => openMeetingStartModal(round.id)}
                  className="btn-primary text-sm"
                >
                  <Microphone size={14} /> 회의 시작
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 진행바 */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2">
          {STAGES.map((s, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            return (
              <div key={s.key} className="flex-1 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  done ? 'bg-brand-primary text-white'
                  : active ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20'
                  : 'bg-ui-low text-ui-variant'
                }`}>
                  {done ? <CheckCircle size={14} weight="fill" /> : s.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold truncate ${active ? 'text-brand-primary' : done ? 'text-ui-on-surface' : 'text-ui-variant'}`}>
                    {s.step}. {s.short}
                  </p>
                </div>
                {i < STAGES.length - 1 && (
                  <div className={`h-0.5 w-4 shrink-0 ${done ? 'bg-brand-primary' : 'bg-ui-high'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-ui-high/40 flex items-center justify-between flex-wrap gap-3">
        <p className="text-xs text-ui-variant">
          등록된 안건 <strong className="text-ui-on-surface">{round.agendas.length}건</strong>
          {round.agendas.length > 0 && (
            <>
              {' · '}표결 완료 <strong className="text-ui-on-surface">{round.agendas.filter(a => a.voteResult && a.voteResult !== 'pending').length}건</strong>
            </>
          )}
        </p>
        <button
          onClick={() => router.push(`/meetings/${round.id}`)}
          className="text-xs font-semibold text-brand-primary hover:text-brand-dim cursor-pointer flex items-center gap-1"
        >
          회의 상세 열기 <ArrowRight size={12} weight="bold" />
        </button>
      </div>
    </div>
  );
}
