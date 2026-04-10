'use client';

import { useState, useEffect } from 'react';
import { getRoundWithOffset, saveRoundOffset } from '@/lib/utils/meetingRound';

export default function MeetingRoundEditor() {
  const [year] = useState(new Date().getFullYear());
  const [round, setRound] = useState<number>(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setRound(getRoundWithOffset(year));
  }, [year]);

  const handleBlur = () => {
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed > 0) {
      saveRoundOffset(parsed, year);
      setRound(parsed);
    }
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-ui-variant">{year}년</span>
      {editing ? (
        <input
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
          className="w-16 text-xl font-bold font-display text-ui-on-surface bg-ui-low rounded-lg px-2 py-0.5 border border-brand-primary outline-none text-center"
          autoFocus
        />
      ) : (
        <button
          onClick={() => { setDraft(String(round)); setEditing(true); }}
          className="text-xl font-bold font-display text-ui-on-surface hover:text-brand-primary transition-colors cursor-pointer"
          title="클릭하여 회차 수정"
        >
          {round}회차
        </button>
      )}
      <span className="text-xs text-ui-variant bg-ui-high px-2 py-0.5 rounded-full">정기회의</span>
    </div>
  );
}
