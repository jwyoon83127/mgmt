'use client';

import { useState, useEffect } from 'react';
import { getRoundWithOffset, saveRoundOffset } from '@/lib/utils/meetingRound';

type MeetingType = 'regular' | 'adhoc';
const MEETING_TYPE_KEY = 'mgmt_meeting_type';

export default function MeetingRoundEditor() {
  const [year] = useState(new Date().getFullYear());
  const [round, setRound] = useState<number>(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [meetingType, setMeetingType] = useState<MeetingType>('regular');

  useEffect(() => {
    setRound(getRoundWithOffset(year));
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(MEETING_TYPE_KEY) as MeetingType | null;
      if (saved === 'regular' || saved === 'adhoc') setMeetingType(saved);
    }
  }, [year]);

  const handleBlur = () => {
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed > 0) {
      saveRoundOffset(parsed, year);
      setRound(parsed);
    }
    setEditing(false);
  };

  const changeType = (type: MeetingType) => {
    setMeetingType(type);
    if (typeof window !== 'undefined') localStorage.setItem(MEETING_TYPE_KEY, type);
  };

  return (
    <div className="flex items-center gap-3">
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
      </div>
      <div className="inline-flex items-center rounded-full bg-ui-high p-0.5" role="tablist" aria-label="회의 종류">
        <button
          role="tab"
          aria-selected={meetingType === 'regular'}
          onClick={() => changeType('regular')}
          className={`text-xs px-3 py-1 rounded-full transition-colors cursor-pointer ${
            meetingType === 'regular'
              ? 'bg-brand-primary text-white font-semibold'
              : 'text-ui-variant hover:text-ui-on-surface'
          }`}
        >
          정기회의
        </button>
        <button
          role="tab"
          aria-selected={meetingType === 'adhoc'}
          onClick={() => changeType('adhoc')}
          className={`text-xs px-3 py-1 rounded-full transition-colors cursor-pointer ${
            meetingType === 'adhoc'
              ? 'bg-brand-primary text-white font-semibold'
              : 'text-ui-variant hover:text-ui-on-surface'
          }`}
        >
          수시회의
        </button>
      </div>
    </div>
  );
}
