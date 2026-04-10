export type MeetingStatus = 'agenda-upload' | 'preview' | 'live' | 'report' | 'completed';
export type VoteResult = 'approved' | 'conditional' | 'review' | 'pending';
export type FollowUpStatus = 'in-progress' | 'delayed' | 'completed' | 'none';
export type VoteType = 'approved' | 'conditional' | 'review';

export interface FileAttachment {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  url: string;
}

export interface Comment {
  id: string;
  agendaId: string;
  author: {
    name: string;
    initial: string;
    avatarColor: string;
  };
  body: string;
  attachments: FileAttachment[];
  createdAt: Date;
}

export interface Agenda {
  id: string;
  meetingId: string;
  index: number; // 1-based
  title: string;
  summary: string;
  submittedAt: Date;
  attachments: FileAttachment[];
  voteResult?: VoteResult;
  voteComment?: string;
  followUpDeadline?: Date;
  followUpStatus?: FollowUpStatus;
  previewComments?: Comment[];
  transcript?: string;
}

export interface Meeting {
  id: string;
  year: number;
  round: number;
  scheduledAt: Date;
  status: MeetingStatus;
  agendas: Agenda[];
}

export interface VoteRecord {
  type: VoteType;
  comment: string;
  submittedAt: Date;
}

export interface LiveAgenda {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  attachmentName: string;
  content: string;
}

export interface KpiData {
  total: number;
  inProgress: number;
  delayed: number;
  completed: number;
}

export interface ArchiveRow {
  id: string;
  round: number;
  agendaTitle: string;
  submittedAt: string;
  voteResult: VoteResult;
  followUpDeadline: string;
  followUpStatus: FollowUpStatus;
}

export interface MeetingRound {
  id: string;
  year: number;
  round: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  attendees: string[];
  agendas: {
    index: number;
    title: string;
    voteResult: VoteType;
    voteComment?: string;
    transcript?: string; // 음성 기록
  }[];
  transcripts?: Record<number, string>; // 안건별 음성 기록 (전체)
  aiSummary?: string; // AI 요약
  voteStats: {
    approved: number;
    conditional: number;
    review: number;
  };
  duration: string; // HH:MM:SS
  createdAt: Date;
}

export interface CeoReport {
  id: string;
  roundId: string;
  title: string;
  summary: string; // 전략적 요약
  keyDecisions: string[]; // 주요 의사결정
  actionItems: string[]; // 조치사항
  risks: string[]; // 위험 요소
  opportunities: string[]; // 기회 요소
  generatedAt: Date;
}
