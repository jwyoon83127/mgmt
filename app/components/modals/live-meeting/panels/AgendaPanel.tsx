'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLiveMeetingStore } from '@/lib/store/liveMeetingStore';
import { LiveAgenda } from '@/lib/types/meeting';
import { useSpeechRecognition } from '@/lib/hooks/useSpeechRecognition';
import VotingToolbar from '../voting/VotingToolbar';

interface AgendaPanelProps {
  agenda: LiveAgenda;
  agendaIndex: number; // 1-based
  isLast: boolean;
}

export default function AgendaPanel({ agenda, agendaIndex, isLast }: AgendaPanelProps) {
  const { submitStep, votes, setVoteComment, transcripts, appendTranscript } = useLiveMeetingStore();
  const [commentOpen, setCommentOpen] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [waveHeights, setWaveHeights] = useState<number[]>([]);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const currentVote = votes[agendaIndex];
  const currentTranscript = transcripts[agendaIndex] || '';

  const handleSpeechResult = useCallback(
    (result: { transcript: string; isFinal: boolean }) => {
      if (result.isFinal) {
        appendTranscript(agendaIndex, result.transcript);
      }
    },
    [agendaIndex, appendTranscript]
  );

  const handleSpeechError = useCallback((error: string) => {
    setSpeechError(error);
    setTimeout(() => setSpeechError(''), 5000);
  }, []);

  const {
    isListening,
    isSupported,
    interimTranscript,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    lang: 'ko-KR',
    continuous: true,
    interimResults: true,
    onResult: handleSpeechResult,
    onError: handleSpeechError,
  });

  // Animate waveform when listening
  useEffect(() => {
    if (isListening) {
      const animate = () => {
        setWaveHeights(
          Array.from({ length: 24 }, () => Math.random() * 100)
        );
        animFrameRef.current = requestAnimationFrame(() => {
          setTimeout(() => {
            animFrameRef.current = requestAnimationFrame(animate);
          }, 120);
        });
      };
      animate();
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      setWaveHeights(Array.from({ length: 24 }, () => 15));
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isListening]);

  const handleSubmit = () => {
    // 음성 인식 중이면 중지
    if (isListening) {
      stopListening();
    }
    submitStep(agendaIndex);
    setCommentOpen(false);
  };

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      setSpeechError('');
      startListening();
    }
  };

  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [currentTranscript, interimTranscript]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 상단: 문서 뷰어 */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* 안건 헤더 */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold text-brand-primary bg-brand-container/15 px-2.5 py-0.5 rounded-full">
            안건 {agendaIndex}
          </span>
          <span className="text-xs text-ui-variant">{agenda.subtitle}</span>
        </div>
        <h2 className="text-xl font-bold font-display text-ui-on-surface mb-6">{agenda.title}</h2>

        {/* 첨부 파일 뷰어 영역 */}
        <div className="rounded-2xl border overflow-hidden mb-6" style={{ background: '#f5f7f9', borderColor: '#e0e4e8' }}>
          <button
            type="button"
            onClick={() => setAttachmentOpen(true)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 border-b hover:bg-ui-low transition-colors cursor-pointer text-left"
            style={{ borderColor: '#e0e4e8' }}
            title="첨부 자료 미리보기 열기"
          >
            <span className="flex items-center gap-2 min-w-0">
              <svg className="w-4 h-4 text-[#ff6b6b] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-xs text-ui-on-surface font-medium truncate">{agenda.attachmentName}</span>
            </span>
            <span className="text-[11px] text-brand-primary font-semibold shrink-0 flex items-center gap-1">
              자료 열기
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </span>
          </button>
          <div className="px-6 py-5 text-ui-on-surface" dangerouslySetInnerHTML={{ __html: agenda.content }} />
        </div>

        {attachmentOpen && (
          <>
            <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setAttachmentOpen(false)} />
            <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
              <div className="w-full max-w-3xl max-h-[85vh] bg-white rounded-3xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-ui-high/40 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-5 h-5 text-[#ff6b6b] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <h3 className="text-sm font-bold text-ui-on-surface truncate">{agenda.attachmentName}</h3>
                  </div>
                  <button
                    onClick={() => setAttachmentOpen(false)}
                    className="text-ui-variant hover:text-ui-on-surface transition-colors cursor-pointer"
                    aria-label="닫기"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-8 py-6 bg-ui-surface">
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-ui-high/40 text-ui-on-surface" dangerouslySetInnerHTML={{ __html: agenda.content }} />
                </div>
                <div className="px-6 py-3 border-t border-ui-high/40 shrink-0 flex justify-end">
                  <button
                    onClick={() => setAttachmentOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-ui-low text-ui-on-surface hover:bg-ui-high transition-colors cursor-pointer"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 음성 녹음 컨트롤 */}
        <div className="rounded-2xl border overflow-hidden mb-4" style={{ background: isListening ? '#f0faf7' : '#f5f7f9', borderColor: isListening ? '#2a676c40' : '#e0e4e8' }}>
          {/* 상단: 컨트롤 바 */}
          <div className="flex items-center gap-3 px-4 py-3">
            {/* 녹음 버튼 */}
            <button
              onClick={toggleRecording}
              disabled={!isSupported}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer
                ${isListening
                  ? 'bg-[#ba1a1a] shadow-lg shadow-[#ba1a1a]/30'
                  : 'bg-brand-primary hover:bg-brand-dim shadow-md shadow-brand-primary/20'
                }
                ${!isSupported ? 'opacity-40 cursor-not-allowed' : ''}
              `}
              title={isListening ? '녹음 중지' : '녹음 시작'}
            >
              {isListening ? (
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className={`text-xs font-semibold ${isListening ? 'text-[#ba1a1a]' : 'text-brand-primary'}`}>
                  {isListening ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse" />
                      음성 녹음 중
                    </span>
                  ) : isSupported ? (
                    '마이크 버튼을 눌러 음성 녹음을 시작하세요'
                  ) : (
                    '이 브라우저는 음성 인식을 지원하지 않습니다'
                  )}
                </p>
              </div>

              {/* 파형 시각화 */}
              <div className="flex items-center gap-0.5 h-5">
                {waveHeights.map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isListening ? 'bg-brand-primary/60' : 'bg-ui-high'
                    }`}
                    style={{ height: `${Math.max(h, 10)}%` }}
                  />
                ))}
              </div>
            </div>

            {/* 녹음 시간 / 상태 */}
            {currentTranscript && (
              <span className="text-xs text-ui-variant shrink-0 tabular-nums">
                {currentTranscript.split(/\s+/).filter(Boolean).length}단어
              </span>
            )}
          </div>

          {/* 에러 메시지 */}
          {speechError && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#ba1a1a]/10 border border-[#ba1a1a]/20">
                <svg className="w-3.5 h-3.5 text-[#ba1a1a] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p className="text-xs text-[#ba1a1a]">{speechError}</p>
              </div>
            </div>
          )}

          {/* 음성 기록 텍스트 */}
          {(currentTranscript || interimTranscript) && (
            <div className="border-t px-4 py-3" style={{ borderColor: '#e0e4e8' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-ui-on-surface">음성 기록</p>
                {currentTranscript && (
                  <button
                    onClick={() => {
                      const text = currentTranscript + (interimTranscript ? ' ' + interimTranscript : '');
                      navigator.clipboard?.writeText(text);
                    }}
                    className="text-xs text-brand-primary hover:text-brand-dim cursor-pointer transition-colors"
                  >
                    복사
                  </button>
                )}
              </div>
              <div
                ref={transcriptScrollRef}
                className="max-h-32 overflow-y-auto text-sm text-ui-on-surface/80 leading-relaxed scroll-smooth"
              >
                {currentTranscript}
                {interimTranscript && (
                  <span className="text-brand-primary/50 italic"> {interimTranscript}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단: 투표 툴바 */}
      <div className="px-8 py-5 border-t shrink-0" style={{ background: '#f8f9fa', borderColor: '#e0e4e8' }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <VotingToolbar agendaIndex={agendaIndex} />
            <button
              onClick={() => setCommentOpen((v) => !v)}
              className="p-2 rounded-xl text-ui-variant hover:text-ui-on-surface hover:bg-ui-low transition-colors cursor-pointer"
              title="의견 추가"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!currentVote}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:cursor-default
              bg-brand-primary text-white hover:bg-brand-dim disabled:opacity-30"
          >
            {isLast ? '결과 종합' : '다음 안건 →'}
          </button>
        </div>

        {/* 의견 입력 */}
        {commentOpen && (
          <div className="mt-4 animate-fade-in-up">
            <textarea
              placeholder="표결 관련 의견을 입력하세요..."
              value={currentVote?.comment ?? ''}
              onChange={(e) => setVoteComment(agendaIndex, e.target.value)}
              rows={2}
              className="w-full px-4 py-3 text-sm rounded-xl border bg-white text-ui-on-surface placeholder:text-ui-low outline-none focus:border-brand-primary resize-none"
              style={{ borderColor: '#d0d5dc' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
