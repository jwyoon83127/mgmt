'use client';

import { useEffect } from 'react';
import { useMeetingStore } from '@/lib/store/meetingStore';
import { useAgendaStore } from '@/lib/store/agendaStore';
import KpiGlances from './KpiGlances';
import AgendaTable from './AgendaTable';
import { ArchiveRow, FollowUpStatus } from '@/lib/types/meeting';

export default function ArchiveSection() {
  const { submittedAgendas } = useAgendaStore();
  const { rounds, fetchRounds } = useMeetingStore();

  // 최초 로드 시 DB에서 회의 데이터 가져오기
  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  // DB에서 불러온 회의 데이터를 테이블(ArchiveRow) 형식으로 변환
  const dbRows: ArchiveRow[] = [];
  rounds.forEach(r => {
    r.agendas?.forEach((a, i) => {
      // 투표 결과에 따른 mock 이행 상태 생성 로직 (현재는 추적 컬럼이 없으므로 임의로 생성)
      let status: FollowUpStatus = 'none';
      if (a.voteResult === 'approved') status = 'completed';
      else if (a.voteResult === 'conditional') status = 'in-progress';
      else if (a.voteResult === 'review') status = 'delayed';

      dbRows.push({
        id: `db-${r.id}-${i}`,
        round: r.round,
        agendaTitle: a.title,
        submittedAt: r.date.replace(/-/g, '.'), // YYYY.MM.DD 포맷으로 통일
        voteResult: a.voteResult as 'approved' | 'conditional' | 'review' | 'pending',
        followUpDeadline: r.date.replace(/-/g, '.'),
        followUpStatus: status,
      });
    });
  });

  // 제출된 신규 안건과 DB 안건 합치기
  const allRows = [...submittedAgendas, ...dbRows];

  // KPI 동적 계산
  const totalCount = allRows.length;
  const inProgressCount = allRows.filter(row => row.followUpStatus === 'in-progress').length;
  const delayedCount = allRows.filter(row => row.followUpStatus === 'delayed').length;
  const completedCount = allRows.filter(row => row.followUpStatus === 'completed').length;

  const dynamicKpi = {
    total: totalCount,
    inProgress: inProgressCount,
    delayed: delayedCount,
    completed: completedCount,
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 rounded-full bg-brand-primary" />
        <h2 className="text-base font-bold font-display text-ui-on-surface tracking-tight">
          Archive & Tracking
        </h2>
        <span className="text-xs text-ui-variant bg-ui-high px-2.5 py-0.5 rounded-full">
          안건 이력 및 이행 현황
        </span>
      </div>

      {/* 카드 */}
      <div className="layer-card overflow-hidden">
        <KpiGlances data={dynamicKpi} />
        <AgendaTable rows={allRows} />
      </div>
    </section>
  );
}
