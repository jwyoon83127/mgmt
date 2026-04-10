'use client';

import { useLiveMeetingStore } from '@/lib/store/liveMeetingStore';
import { VoteType } from '@/lib/types/meeting';

interface VotingToolbarProps {
  agendaIndex: number;
}

const voteOptions: { type: VoteType; label: string; emoji: string; activeClass: string }[] = [
  { type: 'approved', label: '승인', emoji: '✓', activeClass: 'bg-[#9df197] text-[#005c15] border-[#9df197]' },
  { type: 'conditional', label: '조건부승인', emoji: '◎', activeClass: 'bg-[#cfe6f2] text-[#0a1e28] border-[#cfe6f2]' },
  { type: 'review', label: '재검토', emoji: '↩', activeClass: 'bg-[#ffdad6] text-[#410002] border-[#ffdad6]' },
];

export default function VotingToolbar({ agendaIndex }: VotingToolbarProps) {
  const { votes, castVote } = useLiveMeetingStore();
  const currentVote = votes[agendaIndex]?.type;

  return (
    <div className="flex items-center gap-2">
      {voteOptions.map((opt) => {
        const isSelected = currentVote === opt.type;
        return (
          <button
            key={opt.type}
            onClick={() => castVote(agendaIndex, opt.type)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer animate-fade-in-up
              ${isSelected
                ? `${opt.activeClass} scale-105 shadow-md`
                : 'bg-ui-low text-ui-variant border-ui-high/40 hover:bg-ui-high/20 hover:text-ui-on-surface'
              }`}
          >
            <span className="mr-1.5">{opt.emoji}</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
