'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { useMeetingStore } from '@/lib/store/meetingStore';
import { useAuthStore } from '@/lib/store/authStore';
import { MeetingRound, VoteType } from '@/lib/types/meeting';
import { Calendar, Clock, MapPin, Users, Plus, Trash, ArrowLeft, ArrowRight, Check, CaretDown } from '@phosphor-icons/react';

type MeetingType = 'regular' | 'adhoc';

interface DraftAgenda {
  title: string;
  summary: string;
  department: string;
}

export default function NewMeetingPage() {
  const router = useRouter();
  const { addRound, rounds, fetchRounds } = useMeetingStore();
  const { users, currentUser, isAdmin } = useAuthStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [roundInitialized, setRoundInitialized] = useState(false);

  const [meetingType, setMeetingType] = useState<MeetingType>('regular');
  const [info, setInfo] = useState({
    year: new Date().getFullYear(),
    round: 1,
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    location: '임원회의실 (51층)',
  });

  // DB에서 기존 회차 로드 후 다음 회차 번호 자동 설정
  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  useEffect(() => {
    if (roundInitialized) return;
    const sameYear = rounds.filter(r => r.year === info.year);
    const nextRound = sameYear.length > 0 ? Math.max(...sameYear.map(r => r.round)) + 1 : 1;
    setInfo(prev => ({ ...prev, round: nextRound }));
    setRoundInitialized(true);
  }, [rounds, info.year, roundInitialized]);

  // 연도 변경 시 해당 연도의 다음 회차로 자동 조정 (사용자가 회차를 수동 변경하지 않은 경우에만)
  const [roundManuallyEdited, setRoundManuallyEdited] = useState(false);
  useEffect(() => {
    if (!roundInitialized || roundManuallyEdited) return;
    const sameYear = rounds.filter(r => r.year === info.year);
    const nextRound = sameYear.length > 0 ? Math.max(...sameYear.map(r => r.round)) + 1 : 1;
    if (nextRound !== info.round) {
      setInfo(prev => ({ ...prev, round: nextRound }));
    }
  }, [info.year, rounds, roundInitialized, roundManuallyEdited]);

  const duplicateConflict = useMemo(
    () => rounds.some(r => r.year === info.year && r.round === info.round),
    [rounds, info.year, info.round]
  );

  // 기본 참석자: 집행위원 + 간사
  const executiveEmails = users.filter(u => u.email !== currentUser?.email).map(u => u.name);
  const [attendees, setAttendees] = useState<string[]>(
    users.filter(u => u.role !== 'admin').map(u => u.name)
  );
  const toggleAttendee = (name: string) => {
    setAttendees(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const [agendas, setAgendas] = useState<DraftAgenda[]>([
    { title: '', summary: '', department: '' },
  ]);
  const [expandedIdx, setExpandedIdx] = useState<number>(0);

  const addAgenda = () => {
    setAgendas(prev => {
      const next = [...prev, { title: '', summary: '', department: '' }];
      setExpandedIdx(next.length - 1);
      return next;
    });
  };
  const removeAgenda = (i: number) => setAgendas(prev => prev.filter((_, idx) => idx !== i));
  const updateAgenda = (i: number, patch: Partial<DraftAgenda>) => {
    setAgendas(prev => prev.map((a, idx) => idx === i ? { ...a, ...patch } : a));
  };

  const canProceedFromStep1 = info.year && info.round && info.date && info.time && info.location && !duplicateConflict;
  const validAgendas = agendas.filter(a => a.title.trim());

  const handleSubmit = async () => {
    setError('');
    if (duplicateConflict) {
      setError(`${info.year}년 ${info.round}회차는 이미 등록된 회의입니다. 회차 번호를 변경하세요.`);
      setStep(1);
      return;
    }
    if (validAgendas.length === 0) {
      setError('최소 1개의 안건을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    const newRound: MeetingRound = {
      id: `round-${info.year}-${info.round}-${Date.now()}`,
      year: info.year,
      round: info.round,
      date: info.date,
      time: info.time,
      location: info.location,
      attendees,
      agendas: validAgendas.map((a, idx) => ({
        index: idx + 1,
        title: a.title.trim(),
        voteResult: 'pending' as VoteType,
        voteComment: a.summary.trim() ? `[배경] ${a.summary.trim()}${a.department ? ` · 소관: ${a.department}` : ''}` : '',
      })),
      voteStats: { approved: 0, conditional: 0, review: 0 },
      duration: '00:00:00',
      createdAt: new Date(),
    };

    try {
      await addRound(newRound);
      router.push(`/meetings/${newRound.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      console.error(err);
      if (/duplicate/i.test(msg) || /ER_DUP/i.test(msg) || /unique/i.test(msg)) {
        setError(`${info.year}년 ${info.round}회차는 이미 등록된 회의입니다. 회차 번호를 변경하세요.`);
        setStep(1);
      } else {
        setError('회의 생성에 실패했습니다. 입력값을 확인해주세요.');
      }
      setSubmitting(false);
    }
  };

  if (!isAdmin()) {
    return (
      <>
        <AppHeader />
        <main className="min-h-screen bg-ui-surface py-12">
          <div className="max-w-xl mx-auto px-6 text-center">
            <div className="layer-card p-12">
              <h1 className="text-xl font-bold text-ui-on-surface mb-2">접근 권한이 없습니다</h1>
              <p className="text-sm text-ui-variant mb-6">회의 생성은 관리자(간사)만 가능합니다.</p>
              <button onClick={() => router.push('/')} className="btn-secondary">대시보드로</button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-ui-surface py-10">
        <div className="max-w-3xl mx-auto px-6">
          {/* 스텝 인디케이터 */}
          <div className="flex items-center gap-3 mb-8">
            <StepDot active={step === 1} done={step > 1} label="회의 정보" index={1} />
            <div className="flex-1 h-px bg-ui-high" />
            <StepDot active={step === 2} done={false} label="안건 등록" index={2} />
          </div>

          <div className="layer-card p-8">
            {step === 1 && (
              <>
                <h1 className="text-2xl font-bold font-display text-ui-on-surface mb-1">신규 회의 생성</h1>
                <p className="text-sm text-ui-variant mb-6">회의 종류와 일정을 먼저 설정합니다.</p>

                {error && (
                  <div className="mb-5 p-3 rounded-xl bg-[#ba1a1a]/10 border border-[#ba1a1a]/30 text-sm text-[#ba1a1a]">
                    {error}
                  </div>
                )}

                {/* 회의 종류 */}
                <div className="mb-5">
                  <label className="block text-xs font-bold text-ui-variant uppercase mb-2">회의 종류</label>
                  <div className="inline-flex items-center rounded-xl bg-ui-low p-1">
                    {(['regular', 'adhoc'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setMeetingType(t)}
                        className={`text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                          meetingType === t ? 'bg-brand-primary text-white font-semibold' : 'text-ui-variant hover:text-ui-on-surface'
                        }`}
                      >
                        {t === 'regular' ? '정기회의' : '수시회의'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="연도">
                    <input type="number" value={info.year}
                      onChange={e => setInfo({ ...info, year: parseInt(e.target.value) || info.year })}
                      className="field-input" />
                  </Field>
                  <Field label="회차">
                    <input type="number" value={info.round}
                      onChange={e => { setInfo({ ...info, round: parseInt(e.target.value) || 1 }); setRoundManuallyEdited(true); }}
                      className={`field-input ${duplicateConflict ? 'border-[#ba1a1a]' : ''}`} />
                    {duplicateConflict && (
                      <p className="text-[11px] text-[#ba1a1a] mt-1">이미 존재하는 회차입니다. 다른 회차를 입력하세요.</p>
                    )}
                  </Field>
                  <Field label="날짜" icon={<Calendar size={14} />}>
                    <input type="date" value={info.date}
                      onChange={e => setInfo({ ...info, date: e.target.value })}
                      className="field-input" />
                  </Field>
                  <Field label="시간" icon={<Clock size={14} />}>
                    <input type="time" value={info.time}
                      onChange={e => setInfo({ ...info, time: e.target.value })}
                      className="field-input" />
                  </Field>
                </div>

                <div className="mb-4">
                  <Field label="장소" icon={<MapPin size={14} />}>
                    <input type="text" value={info.location}
                      onChange={e => setInfo({ ...info, location: e.target.value })}
                      className="field-input" />
                  </Field>
                </div>

                {/* 참석자 선택 */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-ui-variant uppercase mb-2 flex items-center gap-1.5">
                    <Users size={14} /> 참석자 ({attendees.length}명)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {users.map(u => {
                      const picked = attendees.includes(u.name);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => toggleAttendee(u.name)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                            picked
                              ? 'bg-brand-primary text-white border-brand-primary'
                              : 'bg-white text-ui-on-surface border-ui-high/60 hover:border-brand-primary/50'
                          }`}
                        >
                          {picked && <span className="mr-1">✓</span>}
                          {u.name}
                          {u.role === 'admin' && <span className="ml-1 opacity-70">(간사)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-ui-high/40">
                  <button onClick={() => router.back()} className="btn-secondary">취소</button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canProceedFromStep1}
                    className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    다음: 안건 등록
                    <ArrowRight size={16} weight="bold" />
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="text-2xl font-bold font-display text-ui-on-surface mb-1">안건 등록</h1>
                <p className="text-sm text-ui-variant mb-6">
                  {info.year}년 {info.round}회차 · {meetingType === 'regular' ? '정기회의' : '수시회의'} ·{' '}
                  {info.date} {info.time}
                </p>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-ui-variant">총 {agendas.length}건 · 입력 완료 {validAgendas.length}건</p>
                  <button
                    onClick={addAgenda}
                    className="btn-primary text-xs"
                  >
                    <Plus size={14} weight="bold" /> 안건 추가
                  </button>
                </div>

                <ul className="rounded-2xl border border-ui-high/40 overflow-hidden divide-y divide-ui-high/40 mb-6">
                  {agendas.map((a, i) => {
                    const expanded = expandedIdx === i;
                    const filled = a.title.trim().length > 0;
                    return (
                      <li key={i} className={expanded ? 'bg-white' : 'bg-ui-lowest hover:bg-ui-low transition-colors'}>
                        {/* 컴팩트 헤더 행 */}
                        <div className="flex items-center gap-3 px-4 py-2.5">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            filled ? 'bg-brand-primary text-white' : 'bg-ui-high text-ui-variant'
                          }`}>
                            #{i + 1}
                          </span>
                          <input
                            type="text"
                            value={a.title}
                            onChange={e => updateAgenda(i, { title: e.target.value })}
                            onFocus={() => setExpandedIdx(i)}
                            placeholder="안건 제목 입력 *"
                            className="flex-1 bg-transparent outline-none text-sm font-medium text-ui-on-surface placeholder:text-ui-variant"
                          />
                          {a.department && !expanded && (
                            <span className="text-[11px] text-ui-variant truncate max-w-[120px] hidden sm:inline">{a.department}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setExpandedIdx(expanded ? -1 : i)}
                            className="p-1 rounded text-ui-variant hover:text-ui-on-surface hover:bg-ui-low cursor-pointer shrink-0"
                            title={expanded ? '접기' : '상세 입력 펼치기'}
                          >
                            <CaretDown size={14} weight="bold" className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                          </button>
                          {agendas.length > 1 && (
                            <button
                              type="button"
                              onClick={() => { removeAgenda(i); if (expandedIdx >= agendas.length - 1) setExpandedIdx(Math.max(0, i - 1)); }}
                              className="p-1 rounded text-ui-variant hover:text-[#ba1a1a] hover:bg-[#ba1a1a]/10 cursor-pointer shrink-0"
                              title="안건 삭제"
                            >
                              <Trash size={14} />
                            </button>
                          )}
                        </div>

                        {/* 확장 상세 영역 */}
                        {expanded && (
                          <div className="px-4 pb-4 pt-1 grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in-up">
                            <input
                              type="text"
                              value={a.department}
                              onChange={e => updateAgenda(i, { department: e.target.value })}
                              placeholder="소관 부서 (선택)"
                              className="field-input md:col-span-2"
                            />
                            <textarea
                              value={a.summary}
                              onChange={e => updateAgenda(i, { summary: e.target.value })}
                              placeholder="안건 배경 및 상세 내용 (선택)"
                              rows={3}
                              className="field-input resize-none md:col-span-2"
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-[#ba1a1a]/10 border border-[#ba1a1a]/30 text-sm text-[#ba1a1a]">
                    {error}
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-ui-high/40">
                  <button onClick={() => setStep(1)} className="btn-secondary" disabled={submitting}>
                    <ArrowLeft size={16} weight="bold" />
                    이전
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={addAgenda}
                      disabled={submitting}
                      className="btn-primary"
                    >
                      <Plus size={14} weight="bold" /> 안건 추가
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || validAgendas.length === 0}
                      className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Check size={16} weight="bold" />
                      {submitting ? '생성 중...' : `회의 생성 (${validAgendas.length}개 안건)`}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .field-input {
          width: 100%;
          padding: 0.625rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(var(--color-ui-high-rgb, 224 228 232), 0.6);
          outline: none;
          font-size: 0.875rem;
          background: white;
          transition: border-color 150ms;
        }
        .field-input:focus {
          border-color: #2a676c;
        }
      `}</style>
    </>
  );
}

function StepDot({ index, label, active, done }: { index: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
          done
            ? 'bg-brand-primary text-white'
            : active
            ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20'
            : 'bg-ui-low text-ui-variant'
        }`}
      >
        {done ? <Check size={14} weight="bold" /> : index}
      </div>
      <span className={`text-sm font-semibold ${active || done ? 'text-ui-on-surface' : 'text-ui-variant'}`}>
        {label}
      </span>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-ui-variant uppercase mb-2 flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
