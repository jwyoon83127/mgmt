'use client';

import { MeetingRound } from '@/lib/types/meeting';

interface ReportSidebarProps {
  rounds: MeetingRound[];
  selectedRoundId: string | null;
  onSelectRound: (roundId: string) => void;
}

export default function ReportSidebar({ rounds, selectedRoundId, onSelectRound }: ReportSidebarProps) {
  // 연도별로 그룹화
  const roundsByYear = rounds.reduce(
    (acc, round) => {
      if (!acc[round.year]) acc[round.year] = [];
      acc[round.year].push(round);
      return acc;
    },
    {} as Record<number, MeetingRound[]>
  );

  const years = Object.keys(roundsByYear)
    .map(Number)
    .sort((a, b) => b - a); // 최신 연도 먼저

  return (
    <div className="w-64 shrink-0 border-r border-ui-high overflow-y-auto py-4 no-print">
      {years.map((year) => (
        <div key={year} className="mb-4">
          {/* 연도 헤더 */}
          <h3 className="px-4 py-2 text-xs font-bold text-ui-variant uppercase tracking-wider">{year}년</h3>

          {/* 회차 목록 */}
          {roundsByYear[year]
            .sort((a, b) => b.round - a.round)
            .map((round) => (
              <button
                key={round.id}
                onClick={() => onSelectRound(round.id)}
                className={`w-full text-left px-4 py-3 transition-colors relative cursor-pointer ${
                  selectedRoundId === round.id ? 'bg-ui-low' : 'hover:bg-ui-surface'
                }`}
              >
                {selectedRoundId === round.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-primary rounded-r-full" />
                )}

                {/* 회차 번호 */}
                <p className="text-xs font-semibold text-brand-primary mb-0.5">제{round.round}회</p>

                {/* 날짜 */}
                <p className="text-sm font-medium text-ui-on-surface leading-snug">
                  {new Date(round.date).toLocaleDateString('ko-KR', {
                    month: 'numeric',
                    day: 'numeric',
                  })}
                </p>

                {/* 안건 수 요약 */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {round.voteStats.approved > 0 && (
                    <span className="text-xs px-2 py-1 rounded bg-[#9df197]/20 text-[#005c15] font-semibold">
                      승인 {round.voteStats.approved}
                    </span>
                  )}
                  {round.voteStats.conditional > 0 && (
                    <span className="text-xs px-2 py-1 rounded bg-[#cfe6f2]/20 text-[#0a1e28] font-semibold">
                      조건 {round.voteStats.conditional}
                    </span>
                  )}
                  {round.voteStats.review > 0 && (
                    <span className="text-xs px-2 py-1 rounded bg-[#ffdad6]/20 text-[#410002] font-semibold">
                      재검 {round.voteStats.review}
                    </span>
                  )}
                </div>
              </button>
            ))}
        </div>
      ))}
    </div>
  );
}
