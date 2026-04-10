import { MeetingRound } from '@/lib/types/meeting';
import { LiveAgenda, VoteRecord } from '@/lib/types/meeting';

const COMPLETED_MEETINGS_KEY = 'completed_meetings';

export function saveCompletedMeeting(
  meetingRound: number,
  agendas: LiveAgenda[],
  votes: Record<number, VoteRecord>,
  elapsedSeconds: number,
  meetingDetails?: {
    date?: string;
    time?: string;
    location?: string;
    attendees?: string[];
  },
  transcripts?: Record<number, string>,
  aiSummary?: string,
): MeetingRound {
  const now = new Date();
  const year = now.getFullYear();

  // Convert vote records to agenda vote results
  const agendasWithVotes = agendas.map((agenda) => {
    const vote = votes[agenda.index];
    return {
      ...agenda,
      voteResult: (vote?.type || 'approved') as 'approved' | 'conditional' | 'review',
      voteComment: vote?.comment || '',
      transcript: transcripts?.[agenda.index] || '',
    };
  });

  // Calculate vote stats
  const voteStats = {
    approved: Object.values(votes).filter((v) => v.type === 'approved').length,
    conditional: Object.values(votes).filter((v) => v.type === 'conditional').length,
    review: Object.values(votes).filter((v) => v.type === 'review').length,
  };

  // Format elapsed time
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const duration = `${hours}시간 ${minutes}분`;

  // Create MeetingRound object
  const completedMeeting: MeetingRound = {
    id: `meeting-${year}-${meetingRound}-${Date.now()}`,
    year,
    round: meetingRound,
    date: meetingDetails?.date || new Date().toISOString().split('T')[0],
    time: meetingDetails?.time || '10:00',
    location: meetingDetails?.location || '회의실 A',
    attendees: meetingDetails?.attendees || ['참석자'],
    agendas: agendasWithVotes,
    transcripts: transcripts || {},
    aiSummary: aiSummary || '',
    voteStats,
    duration,
    createdAt: now,
  };

  // Save to localStorage
  const existingMeetings = getCompletedMeetings();
  const updatedMeetings = [completedMeeting, ...existingMeetings];
  localStorage.setItem(COMPLETED_MEETINGS_KEY, JSON.stringify(updatedMeetings));

  return completedMeeting;
}

export function getCompletedMeetings(): MeetingRound[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(COMPLETED_MEETINGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get completed meetings:', error);
    return [];
  }
}

export function clearCompletedMeetings(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(COMPLETED_MEETINGS_KEY);
  }
}
