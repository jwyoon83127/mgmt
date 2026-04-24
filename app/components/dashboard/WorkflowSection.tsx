'use client';

import { useUIStore } from '@/lib/store/uiStore';
import { useMeetingStore } from '@/lib/store/meetingStore';
import WorkflowStepCard from './WorkflowStepCard';
import MeetingRoundEditor from './MeetingRoundEditor';

export default function WorkflowSection() {
  const { openAgendaDrawer, openPreviewModal, openMeetingStartModal, openReportModal } = useUIStore();
  const { rounds } = useMeetingStore();
  const activeRound = rounds.find(r => !r.duration || r.duration === '00:00:00') ?? rounds[0];

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <MeetingRoundEditor />
        <button onClick={() => openAgendaDrawer(activeRound?.id)} className="btn-primary">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          안건 등록
        </button>
      </div>

      {/* 4단계 워크플로우 카드 */}
      <div className="flex items-stretch gap-4">
        <WorkflowStepCard
          number={1}
          label="안건 업로드"
          description="안건을 등록하고 의결 문서를 업로드합니다."
          onClick={() => openAgendaDrawer(activeRound?.id)}
        />

        {/* 연결선 */}
        <div className="flex items-center text-ui-highest">
          <svg width="20" height="2" viewBox="0 0 20 2"><line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" /></svg>
        </div>

        <WorkflowStepCard
          number={2}
          label="사전 검토"
          description="회의 전 의견을 개진하고 관련 데이터를 검토합니다."
          onClick={openPreviewModal}
        />

        <div className="flex items-center text-ui-highest">
          <svg width="20" height="2" viewBox="0 0 20 2"><line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" /></svg>
        </div>

        <WorkflowStepCard
          number={3}
          label="본회의 진행"
          description="음성 기반 자동 요약 및 안건별 표결을 진행합니다."
          isActive
          onClick={() => openMeetingStartModal('')}
        />

        <div className="flex items-center text-ui-highest">
          <svg width="20" height="2" viewBox="0 0 20 2"><line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" /></svg>
        </div>

        <WorkflowStepCard
          number={4}
          label="보고서 출력"
          description="회의록을 확인하고 CEO 요약 보고서를 생성합니다."
          onClick={openReportModal}
        />
      </div>
    </section>
  );
}
