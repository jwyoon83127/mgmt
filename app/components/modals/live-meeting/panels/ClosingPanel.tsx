'use client';

import { useState } from 'react';
import { useLiveMeetingStore } from '@/lib/store/liveMeetingStore';
import { useUIStore } from '@/lib/store/uiStore';
import { useMeetingStore } from '@/lib/store/meetingStore';
import SummaryCard from '../voting/SummaryCard';
import { formatElapsedTime } from '@/lib/utils/meetingRound';
import { saveCompletedMeeting } from '@/lib/utils/meetingSaver';

export default function ClosingPanel() {
  const { agendas, votes, transcripts, elapsedSeconds, resetMeeting, meetingRound, roundId } = useLiveMeetingStore();
  const { closeLiveMeeting } = useUIStore();
  const { updateRound, fetchRounds } = useMeetingStore();
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  const handleGenerateMinutes = async () => {
    setGenerating(true);
    setSummaryError('');

    try {
      // 1. 먼저 음성 기록 요약 생성
      const summarizeRes = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcripts: Object.fromEntries(
            Object.entries(transcripts).map(([k, v]) => [k, v])
          ),
          agendas: agendas.map((a) => ({
            index: a.index,
            title: a.title,
            voteResult: votes[a.index]?.type || 'approved',
            voteComment: votes[a.index]?.comment || '',
          })),
          meetingRound,
        }),
      });

      if (!summarizeRes.ok) throw new Error('요약 생성 실패');
      const summarizeData = await summarizeRes.json();

      // 2. 회의록 생성
      const minutesRes = await fetch('/api/ai/minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingRound,
          date: new Date().toISOString().split('T')[0],
          location: '회의실 A',
          attendees: ['참석자'],
          duration: formatElapsedTime(elapsedSeconds),
          agendas: agendas.map((a) => ({
            index: a.index,
            title: a.title,
            voteResult: votes[a.index]?.type || 'approved',
            voteComment: votes[a.index]?.comment || '',
            transcript: transcripts[a.index] || '',
          })),
          voteStats: {
            approved: Object.values(votes).filter((v) => v.type === 'approved').length,
            conditional: Object.values(votes).filter((v) => v.type === 'conditional').length,
            review: Object.values(votes).filter((v) => v.type === 'review').length,
          },
          transcripts: Object.fromEntries(
            Object.entries(transcripts).map(([k, v]) => [k, v])
          ),
        }),
      });

      if (!minutesRes.ok) throw new Error('회의록 생성 실패');

      setAiSummary(summarizeData.overallSummary || '');
      setGenerated(true);
    } catch (error) {
      console.error('Failed to generate minutes:', error);
      setSummaryError('회의록 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = async () => {
    try {
      saveCompletedMeeting(meetingRound, agendas, votes, elapsedSeconds, undefined, transcripts, aiSummary);
    } catch (error) {
      console.error('Failed to save completed meeting:', error);
    }

    // Persist to DB so the stage advances to 보고서 출력
    if (roundId) {
      const totalSec = elapsedSeconds;
      const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
      const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
      const s = (totalSec % 60).toString().padStart(2, '0');
      const duration = `${h}:${m}:${s}`;

      try {
        await updateRound(roundId, {
          duration,
          agendas: agendas.map(a => ({
            index: a.index,
            title: a.title,
            voteResult: votes[a.index]?.type ?? 'approved',
            voteComment: votes[a.index]?.comment ?? '',
            transcript: transcripts[a.index] ?? '',
          })),
          aiSummary: aiSummary || undefined,
        } as any);
        await fetchRounds();
      } catch (err) {
        console.error('DB 저장 실패:', err);
      }
    }

    closeLiveMeeting();
    setTimeout(resetMeeting, 300);
  };

  const approvedCount = Object.values(votes).filter((v) => v.type === 'approved').length;
  const conditionalCount = Object.values(votes).filter((v) => v.type === 'conditional').length;
  const reviewCount = Object.values(votes).filter((v) => v.type === 'review').length;
  const hasTranscripts = Object.values(transcripts).some((t) => t && t.trim().length > 0);
  const totalWords = Object.values(transcripts).reduce((sum, t) => sum + (t ? t.split(/\s+/).filter(Boolean).length : 0), 0);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-brand-primary/70 uppercase tracking-wider mb-2">회의 결과 종합</p>
        <h2 className="text-2xl font-bold font-display text-ui-on-surface mb-1">모든 안건 표결 완료</h2>
        <p className="text-sm text-ui-variant">총 소요시간: {formatElapsedTime(elapsedSeconds)}</p>
      </div>

      {/* 요약 수치 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: '승인', count: approvedCount, color: '#9df197', textColor: '#005c15' },
          { label: '조건부승인', count: conditionalCount, color: '#cfe6f2', textColor: '#0a1e28' },
          { label: '재검토', count: reviewCount, color: '#ffdad6', textColor: '#410002' },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl p-4 text-center border" style={{ background: '#f5f7f9', borderColor: '#e0e4e8' }}>
            <p className="text-3xl font-bold font-display" style={{ color: item.color }}>{item.count}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: item.textColor }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* 음성 기록 통계 */}
      {hasTranscripts && (
        <div className="rounded-2xl p-4 border mb-6 flex items-center gap-3" style={{ background: '#f0faf7', borderColor: '#2a676c20' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-brand-primary/10">
            <svg className="w-4.5 h-4.5 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ui-on-surface">
              음성 기록 {totalWords}단어 수집 완료
            </p>
            <p className="text-xs text-ui-variant">
              {Object.values(transcripts).filter((t) => t && t.trim().length > 0).length}개 안건에서 음성이 기록되었습니다
            </p>
          </div>
          <button
            onClick={() => setShowSummary((v) => !v)}
            className="text-xs text-brand-primary hover:text-brand-dim cursor-pointer transition-colors font-medium"
          >
            {showSummary ? '접기' : '보기'}
          </button>
        </div>
      )}

      {/* 음성 기록 상세 */}
      {showSummary && hasTranscripts && (
        <div className="rounded-2xl border overflow-hidden mb-6 animate-fade-in-up" style={{ borderColor: '#e0e4e8' }}>
          {agendas.map((agenda) => {
            const transcript = transcripts[agenda.index];
            if (!transcript || transcript.trim().length === 0) return null;
            return (
              <div key={agenda.id} className="px-4 py-3 border-b last:border-b-0" style={{ borderColor: '#e0e4e8' }}>
                <p className="text-xs font-semibold text-brand-primary mb-1">안건 {agenda.index}: {agenda.title}</p>
                <p className="text-sm text-ui-on-surface/80 leading-relaxed">{transcript}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* 안건별 결과 카드 */}
      <div className="space-y-3 mb-8">
        {agendas.map((agenda) => (
          <SummaryCard key={agenda.id} agenda={agenda} vote={votes[agenda.index]} />
        ))}
      </div>

      {/* AI 요약 결과 */}
      {generated && aiSummary && (
        <div className="rounded-2xl border p-5 mb-6 animate-fade-in-up" style={{ background: '#f0faf7', borderColor: '#2a676c20' }}>
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
            </svg>
            <p className="text-sm font-bold text-ui-on-surface">AI 회의 요약</p>
          </div>
          <div className="text-sm text-ui-on-surface/80 leading-relaxed whitespace-pre-line">
            {aiSummary}
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {summaryError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 mb-6">
          <svg className="w-4 h-4 text-[#ba1a1a] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p className="text-sm text-[#ba1a1a]">{summaryError}</p>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex items-center gap-3">
        {generated ? (
          <div className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[#005c15] border"
            style={{ background: 'rgba(157,241,151,0.15)', borderColor: 'rgba(157,241,151,0.4)' }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            회의록 생성 완료
          </div>
        ) : (
          <button
            onClick={handleGenerateMinutes}
            disabled={generating}
            className="btn-primary flex-1 justify-center py-3"
          >
            {generating ? (
              <>
                <svg className="w-4 h-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                AI 회의록 생성 중...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {hasTranscripts ? 'AI 회의록 생성 (음성 기록 포함)' : '회의록 생성'}
              </>
            )}
          </button>
        )}
        <button
          onClick={handleClose}
          className="flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors text-ui-variant hover:text-ui-on-surface border hover:border-ui-high/60"
          style={{ background: '#f5f7f9', borderColor: '#e0e4e8' }}
        >
          회의 종료
        </button>
      </div>
    </div>
  );
}
