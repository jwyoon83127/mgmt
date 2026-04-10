'use client';

import { useState, useEffect, useRef } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { mockLiveAgendas } from '@/lib/mock/meetings';

type CommentItem = { id: string; author: { name: string; initial: string; color: string }; body: string; time: string; attachment: { name: string } | null };

const initialCommentsMap: Record<string, CommentItem[]> = {
  '0': [
    { id: '1', author: { name: '김재원', initial: 'K', color: '#2a676c' }, body: '투자 규모 대비 예상 ROI 산정 기준이 다소 보수적으로 보입니다. 시장 성장률 가정치를 재검토해 주시면 좋겠습니다.', time: '10:24', attachment: null },
    { id: '2', author: { name: '이정은', initial: 'L', color: '#4d626c' }, body: '글로벌 금리 인하 가정이 적용된 시나리오와 현행 유지 시나리오를 병행 제시해 주시겠어요?', time: '10:31', attachment: null },
  ],
  '1': [
    { id: '3', author: { name: '박성준', initial: 'P', color: '#1c6d25' }, body: '3페이지 리스크 헷지 전략 관련 내부 검토 의견 첨부드립니다.', time: '10:45', attachment: { name: '리스크_검토의견서.pdf' } },
  ],
};

export default function PreviewDrawer() {
  const { previewDrawerOpen, closePreviewModal } = useUIStore();
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [comment, setComment] = useState('');
  const [commentsByAgenda, setCommentsByAgenda] = useState<Record<string, CommentItem[]>>(initialCommentsMap);
  const lastSendTimeRef = useRef<number>(0);

  const sendComment = () => {
    const now = Date.now();
    if (!comment.trim() || now - lastSendTimeRef.current < 300) return;

    lastSendTimeRef.current = now;
    const time = new Date();
    const timeStr = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;
    const newComment: CommentItem = {
      id: String(now),
      author: { name: '나 (김위원)', initial: 'K', color: '#2a676c' },
      body: comment.trim(),
      time: timeStr,
      attachment: null,
    };

    const agendaId = String(activeIndex);
    setCommentsByAgenda((prev) => ({
      ...prev,
      [agendaId]: [...(prev[agendaId] || []), newComment],
    }));
    setComment('');
  };

  useEffect(() => {
    if (previewDrawerOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [previewDrawerOpen]);

  if (!previewDrawerOpen) return null;

  const activeAgenda = mockLiveAgendas[activeIndex];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={closePreviewModal}
      />

      <div
        className={`drawer-panel w-full md:w-[900px] transform transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ui-high/40 shrink-0">
          <div>
            <h2 className="text-base font-bold font-display text-ui-on-surface">사전 검토</h2>
            <p className="text-xs text-ui-variant mt-0.5">안건 내용을 확인하고 의견을 남겨주세요</p>
          </div>
          <button onClick={closePreviewModal} className="p-2 rounded-xl hover:bg-ui-low text-ui-variant transition-colors cursor-pointer">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 2-pane 레이아웃 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 좌측: 안건 목록 */}
          <div className="w-64 shrink-0 border-r border-ui-high/40 overflow-y-auto py-4">
            {mockLiveAgendas.map((agenda, i) => (
              <button
                key={agenda.id}
                onClick={() => setActiveIndex(i)}
                className={`w-full text-left px-4 py-3.5 transition-colors relative cursor-pointer ${activeIndex === i ? 'bg-ui-low' : 'hover:bg-ui-surface'}`}
              >
                {activeIndex === i && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-primary rounded-r-full" />
                )}
                <p className="text-xs font-semibold text-brand-primary mb-0.5">안건 {agenda.index}</p>
                <p className="text-sm font-medium text-ui-on-surface leading-snug line-clamp-2">{agenda.title}</p>
                <p className="text-xs text-ui-variant mt-1">{agenda.subtitle}</p>
              </button>
            ))}
          </div>

          {/* 우측: 상세 + 댓글 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 안건 상세 헤더 */}
            <div className="px-6 py-4 border-b border-ui-high/40 shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-brand-primary bg-brand-container/50 px-2.5 py-0.5 rounded-full">
                  안건 {activeAgenda.index}
                </span>
              </div>
              <h3 className="text-base font-bold font-display text-ui-on-surface">{activeAgenda.title}</h3>
              <p className="text-sm text-ui-variant mt-0.5">{activeAgenda.subtitle}</p>

              {/* 첨부 파일 */}
              <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-ui-low rounded-xl w-fit">
                <svg className="w-4 h-4 text-[#ba1a1a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-xs text-ui-on-surface font-medium">{activeAgenda.attachmentName}</span>
                <svg className="w-3.5 h-3.5 text-ui-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
            </div>

            {/* 댓글 스레드 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {(commentsByAgenda[String(activeIndex)] || []).map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: c.author.color }}
                  >
                    {c.author.initial}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-ui-on-surface">{c.author.name}</span>
                      <span className="text-xs text-ui-variant">{c.time}</span>
                    </div>
                    <div className="bg-ui-low rounded-xl rounded-tl-sm px-4 py-3">
                      <p className="text-sm text-ui-on-surface leading-relaxed">{c.body}</p>
                      {c.attachment && (
                        <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-white rounded-lg w-fit">
                          <svg className="w-3.5 h-3.5 text-[#ba1a1a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="text-xs text-ui-on-surface">{c.attachment.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 댓글 입력 */}
            <div className="px-6 py-4 border-t border-ui-high/40 shrink-0">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-xs font-bold text-white shrink-0">K</div>
                <div className="flex-1 flex items-center gap-2 bg-ui-low rounded-xl px-4 py-2.5">
                  <input
                    type="text"
                    placeholder="의견을 입력하세요..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment(); }}}
                    className="flex-1 text-sm bg-transparent outline-none text-ui-on-surface placeholder:text-ui-variant"
                  />
                  <button className="p-1.5 rounded-lg text-ui-variant hover:text-brand-primary transition-colors cursor-pointer">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                  <button
                    onClick={sendComment}
                    disabled={!comment.trim()}
                    className="p-1.5 rounded-lg text-brand-primary disabled:text-ui-variant hover:bg-brand-container/20 transition-colors cursor-pointer disabled:cursor-default"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
