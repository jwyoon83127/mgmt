'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { useMeetingStore } from '@/lib/store/meetingStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useState } from 'react';
import { Plus, Calendar, Clock, MapPin, Users, ChartBar, ArrowRight, Trash } from '@phosphor-icons/react';

export default function MeetingsPage() {
  const router = useRouter();
  const { rounds, fetchRounds, deleteRound, isLoading } = useMeetingStore();
  const isAdmin = useAuthStore(s => s.currentUser?.role === 'admin');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { fetchRounds(); }, [fetchRounds]);

  const handleDelete = async (e: React.MouseEvent, id: string, label: string) => {
    e.stopPropagation();
    if (!confirm(`${label}을(를) 삭제하시겠습니까?\n\n연결된 안건 및 CEO 보고서도 함께 삭제되며, 되돌릴 수 없습니다.`)) return;
    setDeletingId(id);
    try {
      await deleteRound(id);
      setToast(`${label}이(가) 삭제되었습니다.`);
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      setToast('삭제에 실패했습니다.');
      setTimeout(() => setToast(null), 2500);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-ui-surface py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-6 rounded-full bg-brand-primary" />
                <h1 className="text-2xl font-bold font-display text-ui-on-surface">회의 관리</h1>
              </div>
              <p className="text-sm text-ui-variant">정기·수시 회의의 전체 이력과 진행 상황을 관리합니다. 카드를 클릭하여 상세 페이지로 이동하세요.</p>
            </div>
            {isAdmin && (
              <button onClick={() => router.push('/meetings/new')} className="btn-primary">
                <Plus size={16} weight="bold" /> 신규 회의 생성
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-sm text-ui-variant">로딩 중...</div>
          ) : rounds.length === 0 ? (
            <div className="layer-card p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-ui-low text-brand-primary flex items-center justify-center mb-4">
                <Calendar size={28} />
              </div>
              <h2 className="text-lg font-bold text-ui-on-surface mb-2">등록된 회의가 없습니다</h2>
              <p className="text-sm text-ui-variant mb-6">신규 회차를 생성하여 경영집행위원회 프로세스를 시작하세요.</p>
              {isAdmin && (
                <button onClick={() => router.push('/meetings/new')} className="btn-primary mx-auto">
                  <Plus size={16} weight="bold" /> 신규 회의 생성
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rounds.map(r => {
                const pendingCount = r.agendas.filter(a => !a.voteResult || a.voteResult === 'pending').length;
                const isActive = pendingCount > 0;
                const label = `${r.year}년 제${r.round}회`;
                const isDeleting = deletingId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => !isDeleting && router.push(`/meetings/${r.id}`)}
                    className={`layer-card p-5 text-left hover:-translate-y-1 transition-transform cursor-pointer relative group ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, r.id, label)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg text-ui-variant hover:text-[#ba1a1a] hover:bg-[#ba1a1a]/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="회의 삭제"
                        aria-label={`${label} 삭제`}
                      >
                        <Trash size={14} />
                      </button>
                    )}
                    <div className="flex items-center justify-between mb-3 pr-7">
                      <span className="text-xs font-bold text-brand-primary bg-brand-container/30 px-2.5 py-0.5 rounded-full">
                        {label}
                      </span>
                      {isActive ? (
                        <span className="text-[10px] font-bold text-white bg-brand-primary px-2 py-0.5 rounded-full uppercase">
                          진행중
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-ui-variant bg-ui-low px-2 py-0.5 rounded-full">
                          완료
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-ui-on-surface mb-3">경영집행위원회</h3>
                    <div className="space-y-1.5 text-xs text-ui-variant">
                      <p className="flex items-center gap-1.5"><Calendar size={13} />{r.date}</p>
                      <p className="flex items-center gap-1.5"><Clock size={13} />{r.time}</p>
                      <p className="flex items-center gap-1.5"><MapPin size={13} />{r.location}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-ui-high/40 flex items-center justify-between">
                      <span className="text-xs text-ui-variant flex items-center gap-3">
                        <span className="flex items-center gap-1"><Users size={13} />{r.attendees.length}</span>
                        <span className="flex items-center gap-1"><ChartBar size={13} />안건 {r.agendas.length}</span>
                      </span>
                      <ArrowRight size={14} className="text-brand-primary" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-ui-on-surface text-white text-xs font-medium shadow-lg">
            {toast}
          </div>
        )}
      </main>
    </>
  );
}
