import { VoteResult, FollowUpStatus } from '@/lib/types/meeting';

const voteLabels: Record<VoteResult, string> = {
  approved: '승인',
  conditional: '조건부승인',
  review: '재검토',
  pending: '미결',
};

const voteClasses: Record<VoteResult, string> = {
  approved: 'badge bg-[#9df197] text-[#005c15]',
  conditional: 'badge bg-[#cfe6f2] text-[#0a1e28]',
  review: 'badge bg-[#ffdad6] text-[#410002]',
  pending: 'badge bg-ui-high text-ui-variant',
};

const followUpLabels: Record<FollowUpStatus, string> = {
  'in-progress': '진행중',
  delayed: '딜레이',
  completed: '완료',
  none: '-',
};

const followUpClasses: Record<FollowUpStatus, string> = {
  'in-progress': 'badge bg-[#cfe6f2] text-[#0a1e28]',
  delayed: 'badge bg-[#ffdad6] text-[#ba1a1a]',
  completed: 'badge bg-ui-high text-ui-variant',
  none: 'badge bg-ui-low text-ui-variant',
};

export function VoteBadge({ result }: { result: VoteResult }) {
  return <span className={voteClasses[result]}>{voteLabels[result]}</span>;
}

export function FollowUpBadge({ status }: { status: FollowUpStatus }) {
  return <span className={followUpClasses[status]}>{followUpLabels[status]}</span>;
}
