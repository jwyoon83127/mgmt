'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import ArchiveSection from '@/components/archive/ArchiveSection';
import ModalManager from '@/components/modals/ModalManager';
import CurrentMeetingCard from '@/components/dashboard/CurrentMeetingCard';
import { useMeetingStore } from '@/lib/store/meetingStore';
import { useAuthStore } from '@/lib/store/authStore';
import { Plus, ArrowRight, Calendar } from '@phosphor-icons/react';

export default function Home() {
  const router = useRouter();
  const { rounds, fetchRounds } = useMeetingStore();
  const isAdmin = useAuthStore(s => s.currentUser?.role === 'admin');

  useEffect(() => { fetchRounds(); }, [fetchRounds]);

  // 진행중 회의: 안건은 있으나 아직 완료 안 된 것
  const activeRound = rounds.find(r => r.agendas?.some(a => !a.voteResult || a.voteResult === 'pending'));
  // 다음 예정 회의: activeRound 없으면 가장 최근 round
  const featured = activeRound || rounds[0];
  const recentRounds = rounds.slice(0, 4);

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-ui-surface no-print">
        <section className="max-w-7xl mx-auto px-6 py-10">
          {/* 상단 인삿말 + CTA */}
          <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 rounded-full bg-brand-primary" />
                <h1 className="text-2xl font-bold font-display text-ui-on-surface">대시보드</h1>
              </div>
              <p className="text-sm text-ui-variant">회의 생성 → 안건 등록 → 사전 검토 → 본회의 → 보고서 까지의 전체 흐름을 한눈에 확인하고 관리합니다.</p>
            </div>
            {isAdmin && (
              <button onClick={() => router.push('/meetings/new')} className="btn-primary">
                <Plus size={16} weight="bold" />
                신규 회의 생성
              </button>
            )}
          </div>

          {/* 현재 회의 카드 */}
          {featured ? (
            <CurrentMeetingCard round={featured} />
          ) : (
            <div className="layer-card p-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-ui-low text-brand-primary flex items-center justify-center mb-4">
                <Calendar size={28} />
              </div>
              <h2 className="text-lg font-bold text-ui-on-surface mb-2">아직 생성된 회의가 없습니다</h2>
              <p className="text-sm text-ui-variant mb-6">신규 회차를 생성하여 경영집행위원회 프로세스를 시작하세요.</p>
              {isAdmin && (
                <button onClick={() => router.push('/meetings/new')} className="btn-primary">
                  <Plus size={16} weight="bold" /> 신규 회의 생성
                </button>
              )}
            </div>
          )}
        </section>

        {/* 최근 회의 */}
        {recentRounds.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 pb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 rounded-full bg-brand-primary" />
                <h2 className="text-base font-bold font-display text-ui-on-surface">최근 회차</h2>
              </div>
              <button onClick={() => router.push('/meetings')} className="text-xs text-brand-primary hover:text-brand-dim cursor-pointer flex items-center gap-1">
                전체 보기 <ArrowRight size={12} weight="bold" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {recentRounds.map(r => (
                <button
                  key={r.id}
                  onClick={() => router.push(`/meetings/${r.id}`)}
                  className="layer-card p-4 text-left hover:-translate-y-0.5 transition-transform cursor-pointer"
                >
                  <span className="text-xs font-bold text-brand-primary bg-brand-container/30 px-2 py-0.5 rounded-full">
                    {r.year}년 제{r.round}회
                  </span>
                  <p className="text-sm font-semibold text-ui-on-surface mt-2">{r.date}</p>
                  <p className="text-xs text-ui-variant mt-1">안건 {r.agendas.length}건 · 참석 {r.attendees.length}명</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Archive */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-ui-high" />
            <span className="text-xs font-semibold text-ui-variant bg-ui-high px-3 py-1 rounded-full uppercase tracking-wider">
              Archive & Tracking
            </span>
            <div className="flex-1 h-px bg-ui-high" />
          </div>
        </div>
        <ArchiveSection />
      </main>
      <ModalManager />
    </>
  );
}
