'use client';

import { mockKpi, mockArchiveRows } from '@/lib/mock/archive';
import { useAgendaStore } from '@/lib/store/agendaStore';
import KpiGlances from './KpiGlances';
import AgendaTable from './AgendaTable';

export default function ArchiveSection() {
  const { submittedAgendas } = useAgendaStore();

  // 모의 데이터와 제출된 안건 합치기
  const allRows = [...submittedAgendas, ...mockArchiveRows];

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
