import { VoteRecord } from '@/lib/types/meeting';
import { LiveAgenda } from '@/lib/types/meeting';

interface SummaryCardProps {
  agenda: LiveAgenda;
  vote?: VoteRecord;
}

const voteConfig = {
  approved: { label: '승인', bg: 'bg-[#9df197]/20', text: 'text-[#005c15]', border: 'border-[#9df197]/40' },
  conditional: { label: '조건부승인', bg: 'bg-[#cfe6f2]/20', text: 'text-[#0a1e28]', border: 'border-[#cfe6f2]/40' },
  review: { label: '재검토', bg: 'bg-[#ffdad6]/20', text: 'text-[#410002]', border: 'border-[#ffdad6]/40' },
};

export default function SummaryCard({ agenda, vote }: SummaryCardProps) {
  const config = vote ? voteConfig[vote.type] : null;

  return (
    <div className={`rounded-2xl p-5 border animate-fade-in-up ${config ? `${config.bg} ${config.border}` : 'bg-ui-low border-ui-high/40'}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-xs text-ui-variant mb-1">안건 {agenda.index}</p>
          <p className="text-sm font-semibold text-ui-on-surface leading-snug">{agenda.title}</p>
        </div>
        {config && (
          <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${config.text}`} style={{ background: 'rgba(0,0,0,0.05)' }}>
            {config.label}
          </span>
        )}
      </div>
      {vote?.comment && (
        <p className="text-xs text-ui-variant leading-relaxed border-t border-ui-high/40 pt-3">
          &ldquo;{vote.comment}&rdquo;
        </p>
      )}
    </div>
  );
}
