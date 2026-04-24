'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { useAuthStore } from '@/lib/store/authStore';
import { fetchAuditLogs, fetchMailLogs } from '@/lib/actions/logsActions';
import type { AuditRow } from '@/lib/services/auditService';
import type { MailLog } from '@/lib/services/mailLogService';
import { ClipboardText, EnvelopeSimple, ArrowClockwise } from '@phosphor-icons/react';

const ACTION_LABEL: Record<string, string> = {
  login_success: '로그인 성공', login_failed: '로그인 실패', logout: '로그아웃',
  user_created: '사용자 생성', user_deleted: '사용자 삭제', password_reset: '비밀번호 재설정',
  smtp_updated: 'SMTP 설정 변경', smtp_cleared: 'SMTP 설정 초기화', smtp_tested: 'SMTP 연결 테스트',
  mail_sent: '메일 발송 성공', mail_failed: '메일 발송 실패',
};

const ACTION_TONE: Record<string, string> = {
  login_failed: 'bg-[#ba1a1a]/10 text-[#ba1a1a]',
  mail_failed: 'bg-[#ba1a1a]/10 text-[#ba1a1a]',
  user_deleted: 'bg-[#ba1a1a]/10 text-[#ba1a1a]',
  smtp_cleared: 'bg-[#ba1a1a]/10 text-[#ba1a1a]',
  login_success: 'bg-[#9df197]/20 text-[#005c15]',
  mail_sent: 'bg-[#9df197]/20 text-[#005c15]',
  user_created: 'bg-[#9df197]/20 text-[#005c15]',
  password_reset: 'bg-brand-container/50 text-brand-primary',
  smtp_updated: 'bg-brand-container/50 text-brand-primary',
  smtp_tested: 'bg-brand-container/50 text-brand-primary',
  logout: 'bg-ui-low text-ui-variant',
};

function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
}

export default function AdminLogsPage() {
  const router = useRouter();
  const { isAdmin } = useAuthStore();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<'audit' | 'mail'>('audit');
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [mails, setMails] = useState<MailLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setReady(true); }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      if (tab === 'audit') setAudits(await fetchAuditLogs(200));
      else setMails(await fetchMailLogs(100));
    } finally { setLoading(false); }
  };

  useEffect(() => { if (ready && isAdmin()) void refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [ready, tab]);

  if (ready && !isAdmin()) {
    return (
      <>
        <AppHeader />
        <main className="min-h-screen bg-ui-surface py-12">
          <div className="max-w-xl mx-auto px-6 text-center layer-card p-12">
            <h1 className="text-xl font-bold text-ui-on-surface mb-2">접근 권한이 없습니다</h1>
            <p className="text-sm text-ui-variant mb-6">로그 조회는 관리자만 가능합니다.</p>
            <button onClick={() => router.push('/')} className="btn-secondary">대시보드로</button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-ui-surface py-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-6 rounded-full bg-brand-primary" />
                <h1 className="text-2xl font-bold font-display text-ui-on-surface">감사 로그</h1>
              </div>
              <p className="text-sm text-ui-variant">사용자 활동과 메일 발송 이력을 조회합니다.</p>
            </div>
            <button onClick={refresh} disabled={loading} className="btn-secondary disabled:opacity-50">
              <ArrowClockwise size={14} weight="bold" />
              {loading ? '불러오는 중...' : '새로고침'}
            </button>
          </div>

          <div className="flex gap-2 mb-4 border-b border-ui-high/30">
            <TabButton active={tab==='audit'} onClick={() => setTab('audit')} icon={<ClipboardText size={14} weight="bold" />} label="활동 로그" />
            <TabButton active={tab==='mail'} onClick={() => setTab('mail')} icon={<EnvelopeSimple size={14} weight="bold" />} label="메일 발송 이력" />
          </div>

          {tab === 'audit' ? (
            <div className="layer-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-ui-low/50 text-ui-variant text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">시각</th>
                    <th className="text-left px-4 py-3">행위</th>
                    <th className="text-left px-4 py-3">수행자</th>
                    <th className="text-left px-4 py-3">대상</th>
                    <th className="text-left px-4 py-3">세부</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-ui-variant py-10">기록이 없습니다.</td></tr>
                  ) : audits.map(a => (
                    <tr key={a.id} className="border-t border-ui-high/20">
                      <td className="px-4 py-2.5 font-mono text-xs text-ui-variant whitespace-nowrap">{fmtTime(a.occurredAt)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${ACTION_TONE[a.action] ?? 'bg-ui-low text-ui-variant'}`}>
                          {ACTION_LABEL[a.action] ?? a.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-ui-on-surface">{a.actorEmail ?? <span className="text-ui-variant">—</span>}</td>
                      <td className="px-4 py-2.5 text-ui-on-surface">{a.targetLabel ?? <span className="text-ui-variant">—</span>}</td>
                      <td className="px-4 py-2.5 text-xs text-ui-variant max-w-xs truncate">
                        {a.details ? JSON.stringify(a.details) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="layer-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-ui-low/50 text-ui-variant text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">시각</th>
                    <th className="text-left px-4 py-3">상태</th>
                    <th className="text-left px-4 py-3">수신자</th>
                    <th className="text-left px-4 py-3">제목</th>
                    <th className="text-left px-4 py-3">유형</th>
                    <th className="text-left px-4 py-3">비고</th>
                  </tr>
                </thead>
                <tbody>
                  {mails.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-ui-variant py-10">기록이 없습니다.</td></tr>
                  ) : mails.map(m => (
                    <tr key={m.id} className="border-t border-ui-high/20">
                      <td className="px-4 py-2.5 font-mono text-xs text-ui-variant whitespace-nowrap">{fmtTime(m.sentAt)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${m.status === 'sent' ? 'bg-[#9df197]/20 text-[#005c15]' : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'}`}>
                          {m.status === 'sent' ? '성공' : '실패'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-ui-on-surface">{m.to}</td>
                      <td className="px-4 py-2.5 text-ui-on-surface max-w-xs truncate">{m.subject ?? '—'}</td>
                      <td className="px-4 py-2.5 text-xs text-ui-variant">{m.mailType}</td>
                      <td className="px-4 py-2.5 text-xs text-ui-variant max-w-xs truncate">{m.error ?? m.messageId ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-2 -mb-px ${
        active ? 'border-brand-primary text-brand-primary' : 'border-transparent text-ui-variant hover:text-ui-on-surface'
      }`}
    >
      {icon}{label}
    </button>
  );
}
