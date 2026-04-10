'use client';

import { MeetingRound } from '@/lib/types/meeting';
import { useState, useRef } from 'react';
import { generatePdfReport } from '@/lib/utils/pdfGenerator';
import { generateCeoReport, downloadCeoReportPdf } from '@/lib/utils/ceoReportGenerator';

interface ReportPanelProps {
  round: MeetingRound | null;
}

type TabType = 'minutes' | 'ceoReport';

export default function ReportPanel({ round }: ReportPanelProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('minutes');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ceoReportData, setCeoReportData] = useState<any>(null);

  if (!round) {
    return (
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="text-center">
          <svg className="w-12 h-12 text-ui-variant mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <p className="text-sm text-ui-variant">회의 회차를 선택해주세요</p>
        </div>
      </div>
    );
  }

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleDownloadCeoReportPdf = () => {
    window.print();
  };

  const generateAndDisplayCeoReport = () => {
    if (!ceoReportData && round) {
      const report = generateCeoReport(round);
      setCeoReportData(report);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 헤더 (인쇄 시 제목 포함) */}
      <div className="px-8 py-6 border-b border-ui-high shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold text-brand-primary bg-brand-container px-2.5 py-0.5 rounded-full">
            제{round.round}회 회의
          </span>
          <span className="text-xs text-ui-variant">({formatDate(round.date)})</span>
        </div>

        {/* 탭 (인쇄 시 숨김) */}
        <div className="flex gap-1 mb-4 border-b border-ui-high -mx-8 px-8 no-print">
          <button
            onClick={() => setActiveTab('minutes')}
            className={`pb-4 px-2 text-sm font-semibold transition-colors ${
              activeTab === 'minutes'
                ? 'text-brand-primary border-b-2 border-brand-primary'
                : 'text-ui-variant hover:text-ui-on-surface'
            }`}
          >
            회의록
          </button>
          <button
            onClick={() => {
              setActiveTab('ceoReport');
              generateAndDisplayCeoReport();
            }}
            className={`pb-4 px-2 text-sm font-semibold transition-colors ${
              activeTab === 'ceoReport'
                ? 'text-brand-primary border-b-2 border-brand-primary'
                : 'text-ui-variant hover:text-ui-on-surface'
            }`}
          >
            CEO 보고서
          </button>
        </div>

        <h2 className="text-2xl font-bold font-display text-ui-on-surface mb-1">
          {activeTab === 'minutes' ? '경영집행위원회 회의록' : 'CEO 보고서'}
        </h2>
        <p className="text-sm text-ui-variant">
          {activeTab === 'minutes' ? '회의 기본정보 및 안건별 의결 현황' : '경영진 보고 요약 및 전략 분석'}
        </p>
      </div>

      {/* 컨텐츠 */}
      <div ref={reportRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-white printable-report">
        {activeTab === 'minutes' ? (
          <>
            {/* 기본정보 */}
            <div className="rounded-2xl border border-ui-high p-6" style={{ backgroundColor: '#f8f9fa' }}>
              <h3 className="text-sm font-bold text-ui-on-surface mb-4">회의 기본정보</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-ui-variant mb-1">날짜</p>
                  <p className="text-sm font-semibold text-ui-on-surface">{formatDate(round.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-ui-variant mb-1">시간</p>
                  <p className="text-sm font-semibold text-ui-on-surface">{round.time}</p>
                </div>
                <div>
                  <p className="text-xs text-ui-variant mb-1">장소</p>
                  <p className="text-sm font-semibold text-ui-on-surface">{round.location}</p>
                </div>
                <div>
                  <p className="text-xs text-ui-variant mb-1">소요시간</p>
                  <p className="text-sm font-semibold text-ui-on-surface">{round.duration}</p>
                </div>
              </div>
            </div>

            {/* 참석자 */}
            <div className="rounded-2xl border border-ui-high p-6" style={{ backgroundColor: '#f8f9fa' }}>
              <h3 className="text-sm font-bold text-ui-on-surface mb-4">참석자</h3>
              <div className="flex flex-wrap gap-2">
                {round.attendees.map((attendee, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-ui-low text-ui-on-surface border border-ui-high">
                    {attendee}
                  </span>
                ))}
              </div>
            </div>

            {/* AI 요약 */}
            {round.aiSummary && (
              <div className="rounded-2xl border border-ui-high p-6" style={{ backgroundColor: '#f8f9fa' }}>
                <h3 className="text-sm font-bold text-ui-on-surface mb-3">AI 요약</h3>
                <p className="text-sm text-ui-variant leading-relaxed whitespace-pre-wrap">
                  {round.aiSummary}
                </p>
              </div>
            )}

            {/* 의결현황 요약 */}
            <div className="rounded-2xl border border-ui-high p-6" style={{ backgroundColor: '#f8f9fa' }}>
              <h3 className="text-sm font-bold text-ui-on-surface mb-4">의결현황</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold font-display text-[#005c15]">{round.voteStats.approved}</p>
                  <p className="text-xs text-ui-variant mt-2">승인</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold font-display text-[#0a1e28]">{round.voteStats.conditional}</p>
                  <p className="text-xs text-ui-variant mt-2">조건부승인</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold font-display text-[#410002]">{round.voteStats.review}</p>
                  <p className="text-xs text-ui-variant mt-2">재검토</p>
                </div>
              </div>
            </div>

            {/* 안건별 결과 */}
            <div className="rounded-2xl border border-ui-high p-6" style={{ backgroundColor: '#f8f9fa' }}>
              <h3 className="text-sm font-bold text-ui-on-surface mb-4">안건별 의결 결과</h3>
              <div className="space-y-3">
                {round.agendas.map((agenda) => {
                  const voteConfig = {
                    approved: { bg: 'bg-[#9df197]', text: 'text-[#005c15]', label: '승인' },
                    conditional: { bg: 'bg-[#cfe6f2]', text: 'text-[#0a1e28]', label: '조건부승인' },
                    review: { bg: 'bg-[#ffdad6]', text: 'text-[#410002]', label: '재검토' },
                  };
                  const config = voteConfig[agenda.voteResult];

                  return (
                    <div key={agenda.index} className={`rounded-xl p-4 border ${config.bg} border-ui-high`}>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <p className="text-xs text-ui-variant mb-1">안건 {agenda.index}</p>
                          <p className="text-sm font-semibold text-ui-on-surface leading-snug">{agenda.title}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${config.text}`} style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                          {config.label}
                        </span>
                      </div>
                      {agenda.voteComment && <p className="text-xs text-ui-variant leading-relaxed border-t border-ui-high pt-2 mt-2">&ldquo;{agenda.voteComment}&rdquo;</p>}
                      {agenda.transcript && (
                        <div className="mt-3 pt-3 border-t border-ui-high">
                          <p className="text-[10px] font-bold text-ui-variant mb-1 uppercase tracking-tight">발언 기록</p>
                          <p className="text-xs text-ui-on-surface leading-relaxed opacity-80">{agenda.transcript}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* CEO 보고서 */}
            {ceoReportData ? (
              <>
                {/* 보고서 제목 */}
                <div className="rounded-2xl border border-ui-high p-6" style={{ backgroundColor: '#f8f9fa' }}>
                  <h3 className="text-sm font-bold text-ui-on-surface mb-2">보고서 제목</h3>
                  <p className="text-base font-semibold text-ui-on-surface">{ceoReportData.title}</p>
                </div>

                {/* 요약 */}
                <div className="rounded-2xl border border-ui-high p-6" style={{ backgroundColor: '#f8f9fa' }}>
                  <h3 className="text-sm font-bold text-ui-on-surface mb-3">요약</h3>
                  <p className="text-sm text-ui-on-surface leading-relaxed whitespace-pre-wrap">{ceoReportData.summary}</p>
                </div>

                {/* 주요 의사결정 */}
                <div className="rounded-2xl border border-ui-high p-6" style={{ backgroundColor: '#f8f9fa' }}>
                  <h3 className="text-sm font-bold text-ui-on-surface mb-3">주요 의사결정</h3>
                  <ul className="space-y-2">
                    {ceoReportData.keyDecisions.map((decision: string, idx: number) => (
                      <li key={idx} className="text-sm text-ui-on-surface flex gap-2">
                        <span className="text-brand-primary font-bold">•</span>
                        <span>{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 조치사항 */}
                <div className="rounded-2xl border border-ui-high p-6" style={{ backgroundColor: '#f8f9fa' }}>
                  <h3 className="text-sm font-bold text-ui-on-surface mb-3">조치사항</h3>
                  <ul className="space-y-2">
                    {ceoReportData.actionItems.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm text-ui-on-surface flex gap-2">
                        <span className="text-brand-primary font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 위험 요소 */}
                {ceoReportData.risks.length > 0 && (
                  <div className="rounded-2xl border border-ui-high p-6" style={{ background: 'rgba(255, 218, 214, 0.2)' }}>
                    <h3 className="text-sm font-bold text-[#410002] mb-3">⚠️ 위험 요소</h3>
                    <ul className="space-y-2">
                      {ceoReportData.risks.map((risk: string, idx: number) => (
                        <li key={idx} className="text-sm text-ui-on-surface flex gap-2">
                          <span className="text-[#ba1a1a] font-bold">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 기회 요소 */}
                {ceoReportData.opportunities.length > 0 && (
                  <div className="rounded-2xl border border-ui-high p-6" style={{ background: 'rgba(157, 241, 151, 0.2)' }}>
                    <h3 className="text-sm font-bold text-[#005c15] mb-3">✓ 기회 요소</h3>
                    <ul className="space-y-2">
                      {ceoReportData.opportunities.map((opportunity: string, idx: number) => (
                        <li key={idx} className="text-sm text-ui-on-surface flex gap-2">
                          <span className="text-[#005c15] font-bold">•</span>
                          <span>{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <svg className="w-12 h-12 text-ui-variant mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                  <p className="text-sm text-ui-variant">보고서를 생성 중입니다...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="px-8 py-6 border-t border-ui-high shrink-0 flex gap-3 no-print">
        <button
          onClick={() => window.print()}
          disabled={isGenerating}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:cursor-default transition-all duration-200 bg-brand-primary text-white hover:bg-brand-dim disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <svg className="w-4 h-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              생성 중...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              {activeTab === 'minutes' ? '회의록 PDF 다운로드' : 'CEO 보고서 PDF 다운로드'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
